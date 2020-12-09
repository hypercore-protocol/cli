import chalk from 'chalk'
import bytes from 'bytes'
import hypercoreCrypto from 'hypercore-crypto'
import * as hyper from '../hyper/index.js'
import * as HyperStruct from '../hyper/struct.js'
import * as netStats from '../hyper/net-stats.js'
import { statusLogger } from '../status-logger.js'
import { parseHyperUrl } from '../urls.js'

const FULL_USAGE = `
Examples:

  hyp info hyper://1234..af/
  hyp info hyper://1234..af/ hyper://fedc..21/
`

export default {
  name: 'info',
  description: 'Show information about one (or more) hypers.',
  usage: {
    simple: '{urls...}',
    full: FULL_USAGE
  },
  command: async function (args) {
    if (!args._[0]) throw new Error('At least 1 URL is required')

    var keys = []
    for (let url of args._) {
      let urlp = parseHyperUrl(url)
      keys.push(urlp.hostname)
    }

    var statusLines = keys.map(k => `${chalk.bold(short(k))}: Loading...`)
    var statusLog = statusLogger(statusLines)
    statusLog.print()

    keys.forEach(async (key, i) => {
      var tracker = new HyperStructInfoTracker(key)

      // periodically update stdout with the status-line
      const updateStatusLine = () => {
        statusLines[i] = tracker.genStatusLine()
        statusLog.print()
      }
      updateStatusLine()
      setInterval(updateStatusLine, 1e3).unref()

      // periodically calculate the size of the hyper structure
      const updateState = async () => {
        await tracker.fetchState().catch(console.error)
        setTimeout(updateState, 1e3).unref()
      }
      updateState()
    })
  }
}

class HyperStructInfoTracker {
  constructor (keyStr) {
    this.keyStr = keyStr
    this.key = Buffer.from(keyStr, 'hex')
    this.discoveryKey = hypercoreCrypto.discoveryKey(this.key)

    this.size = undefined
    this.totalBlocks = undefined
    this.downloadedBlocks = undefined
    this.netCfg = undefined
    this.netStats = undefined
    this.struct = undefined
    this.loadStructPromise = undefined
  }

  get peers () {
    if (!this.struct) return []
    return (this.struct.api.metadata || this.struct.api.feed || this.struct.api).peers
  }

  genStatusLine () {
    var netCfg = 'Not swarming'
    if (this.netCfg) {
      if (this.netCfg.announce) netCfg = `Announced to seed`
      else if (this.netCfg.lookup) netCfg = `Watching for announced seeders`
    }
    if (!this.struct) {
      return `${chalk.bold(short(this.keyStr))}: ${netCfg}`
    }

    var stats = this.netStats
    var dl = bytes(stats.download[stats.download.length - 1], {unitSeparator: ' '})
    var ul = bytes(stats.upload[stats.download.length - 1], {unitSeparator: ' '})
    return `
      ${chalk.bold(short(this.keyStr))}:
      ${this.peers.length} connected |
      ${typeof this.totalBlocks !== 'undefined'
        ? `${this.totalBlocks ? Math.round(this.downloadedBlocks/this.totalBlocks*100) : 100}% downloaded (${bytes(this.size)} total)`
        : 'Calculating...'}
      [↓${dl}/s ↑${ul}/s]
      - ${netCfg}
    `.split('\n').map(s => s.trim()).join(' ')
  }

  async fetchState () {
    this.netCfg = await hyper.getClient().network.status(this.discoveryKey)

    if (!this.struct) {
      /* dont await */ this.attemptLoadStruct()
      return
    }

    await this.calcBlockState()
  }

  async attemptLoadStruct () {
    if (this.loadStructPromise) {
      return this.loadStructPromise
    }
    this.loadStructPromise = new Promise(async (resolve, reject) => {
      try {
        this.struct = await HyperStruct.get(this.keyStr, {noNetConfig: true, expect: undefined})
        this.netStats = netStats.get(this.struct)
        resolve()
      } catch (e) {
        // suppress errors
      }
    })
  }

  async calcBlockState () {
    if (!this.struct) return
    if (this.struct.type === 'hyperdrive') {
      let [total, size, downloaded] = [0, 0, 0]
      let contentCore = await new Promise(resolve => this.struct.api.getContent((err, core) => resolve(core)))
      for (let entry of await this.struct.api.promises.readdir('/', {recursive: true, includeStats: true})) {
        total += entry.stat.blocks
        size += entry.stat.size
        downloaded += await countHasCoreBlocks(contentCore, entry.stat.offset, entry.stat.offset + entry.stat.blocks)
      }
      this.totalBlocks = total
      this.size = size
      this.downloadedBlocks = downloaded
    } else if (this.struct.type === 'hyperbee') {
      this.downloadedBlocks = await this.struct.api.feed.downloaded()
      this.totalBlocks = this.struct.api.feed.length
      this.size = this.struct.api.feed.byteLength
    } else {
      this.downloadedBlocks = await this.struct.api.downloaded()
      this.totalBlocks = this.struct.api.length
      this.size = this.struct.api.byteLength
    }
  }
}

function short (key) {
  return `${key.slice(0, 6)}..${key.slice(-2)}`
}

async function countHasCoreBlocks (core, from, to) {
  var count = 0
  for (let i = from; i < to; i++) {
    count += (await core.has(i)) ? 1 : 0
  }
  return count
}