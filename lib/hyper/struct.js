import EventEmitter from 'events'
import hyperdrive from 'hyperdrive'
import Hyperbee from 'hyperbee'
import { getClient } from './index.js'
import lock from '../lock.js'
import { fromURLToKeyStr } from '../urls.js'
import HypertrieMessages from 'hypertrie/lib/messages.js'
import HyperbeeMessages from 'hyperbee/lib/messages.js'

// globals
// =

export const activeStructures = {} // [keyStr] => HyperStructure

// exported apis
// =

class HyperStructure extends EventEmitter {
  constructor (keyStr) {
    super()
    this.keyStr = keyStr
    this.type = undefined
    this.header = undefined
    this.api = undefined
  }

  get key () {
    return this.core?.key
  }

  get discoveryKey () {
    return this.core?.discoveryKey
  }

  get url () {
    return `hyper://${this.keyStr}/`
  }

  get core () {
    if (!this.api) return undefined
    if (this.type === 'hyperdrive') return this.api.metadata
    if (this.type === 'hyperbee') return this.api.feed
  }

  async load ({noNetConfig} = {noNetConfig: false}) {
    var core
    var wasOpen = !!this.api

    // detect the hyper-structure type
    if (!this.type || !this.header) {
      core = getClient().corestore().get(this.keyStr)
      await core.ready()
      if (!noNetConfig) getClient().network.configure(core, {lookup: true, announce: true})
      let headerBlock = await core.get(0)
      try {
        this.header = HypertrieMessages.Header.decode(headerBlock)
        if (this.header.type === 'hypertrie') {
          this.type = this.header.subtype || 'hyperdrive'
        } else {
          throw new Error() // bounce to the next parser
        }
      } catch {
        try {
          this.header = HyperbeeMessages.Header.decode(headerBlock)
          if (this.header?.protocol !== 'hyperbee') {
            throw new Error() // bounce to next parser
          }
          this.type = 'hyperbee'
        } catch {
          this.header = undefined
          this.type = 'unknown'
        }
      }
    }

    // load the hyper-structure API session
    if (this.type === 'hyperdrive') {
      this.api = hyperdrive(getClient().corestore(), this.keyStr, {extension: false})
      await this.api.promises.ready()
    } else if (this.type === 'hyperbee') {
      core = core || getClient().corestore().get(this.keyStr)
      this.api = new Hyperbee(core, {
        keyEncoding: 'binary',
        valueEncoding: 'json'
      })
      await this.api.ready()
    } else {
      this.api = core || getClient().corestore().get(this.keyStr)
      await this.api.ready()
    }

    if (wasOpen) {
      this.emit('reloaded')
    }
  }

  async create (type, {noNetConfig} = {noNetConfig: false}) {
    if (this.type) {
      throw new Error('Cannot call create on a hyper structure that already exists')
    }
    if (type !== 'hyperdrive' && type !== 'hyperbee') {
      throw new Error(`Unknown hypercore structure type (${type}) cannot create`)
    }

    this.type = type

    if (this.type === 'hyperdrive') {
      this.api = hyperdrive(getClient().corestore(), null, {extension: false})
      await this.api.promises.ready()
      this.keyStr = this.key.toString('hex')
    } else if (this.type === 'hyperbee') {
      let core = getClient().corestore().get(null)
      this.api = new Hyperbee(core, {
        keyEncoding: 'binary',
        valueEncoding: 'json'
      })
      await this.api.ready()
      this.keyStr = this.key.toString('hex')
    }

    if (!noNetConfig) getClient().network.configure(this.core, {lookup: true, announce: true})
  }


  async close () {
    if (this.api) {
      // TODO do we need to configure the network with announce/lookup false?
      this.api.close()
      this.api = undefined
      this.emit('closed')
    }
  }
}

export async function get (key, {expect, noNetConfig} = {expect: undefined, noNetConfig: false}) {
  var keyStr = fromURLToKeyStr(key)
  var release = await lock(`hyper-struct-get:${keyStr}`)
  try {
    if (keyStr in activeStructures) {
      return activeStructures[keyStr]
    }
    var struct = new HyperStructure(keyStr)
    await struct.load({noNetConfig})
    activeStructures[keyStr] = struct

    if (expect && struct.type !== expect) {
      throw new Error(`The hyper:// was expected to be a ${expect}, got ${struct.type}`)
    }

    return struct
  } finally {
    release()
  }
}

export async function create (type) {
  var struct = new HyperStructure(null)
  await struct.create(type)
  activeStructures[struct.keyStr] = struct
  return struct
}
