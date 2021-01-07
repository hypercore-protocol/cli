import chalk from 'chalk'
import { getClient, getMirroringClient } from '../hyper/index.js'
import { statusLogger } from '../status-logger.js'
import { parseHyperUrl } from '../urls.js'
import { HyperStructInfoTracker } from '../hyper/info-tracker.js'

const FULL_USAGE = `
  If no URLs are specified, will list all hypers currently seeded.

Options:

  --live - Continuously output the current state.
  -l/--long - List the full keys of the hypers.

Examples:

  hyp info
  hyp info --live
  hyp info hyper://1234..af/
  hyp info hyper://1234..af/ hyper://fedc..21/
`

export default {
  name: 'info',
  description: 'Show information about one (or more) hypers.',
  usage: {
    simple: '[urls...]',
    full: FULL_USAGE
  },
  options: [
    {
      name: 'long',
      default: false,
      abbr: 'l',
      boolean: true
    },
    {
      name: 'live',
      default: false,
      boolean: true
    }
  ],
  command: async function (args) {
    var useLiveOutput = process.stdout.isTTY
    var hyperClient = getClient()
    var mirroringClient = getMirroringClient()

    if (!useLiveOutput && args.live) {
      console.error('Cannot pipe output of "hyp info" with --live set, disabling live-mode.')
      args.live = false
    }

    var keys
    if (!args._.length) {
      keys = await getAllKeys(mirroringClient)
    } else {
      keys = []
      for (let url of args._) {
        let urlp = parseHyperUrl(url)
        keys.push(urlp.hostname)
      }
    }

    if (!keys.length) {
      console.log(`No hypers active.`)
      process.exit(0)
    }

    if (useLiveOutput) {
      var statusLines = keys.map(k => `${chalk.bold(short(k))}: Loading...`)
      var statusLog = statusLogger(statusLines)
      statusLog.print()
    }

    await Promise.all(keys.map(async (key, i) => {
      const log = (str) => {
        if (useLiveOutput) {
          statusLines[i] = str
          statusLog.print()
        } else {
          console.log(str)
        }
      }
      const weaklog = (str) => {
        // only log if live output
        if (useLiveOutput) log(str)
      }

      var tracker = new HyperStructInfoTracker(key)
      await tracker.attemptLoadStruct()
      var mirror = null
      var network = null

      // periodically update stdout with the status-line
      const updateStatusLine = () => {
        if (!network && !mirror) {
          weaklog(`${tracker.genStatusIdent(args.long)}...`)
        } else {
          const networkStatusLine = network && network.announce ? 'but online (announcing)' : 'and not online'
          const seedingStatusLine = mirror && mirror.mirroring ? 'Seeding' : `Not seeding ${networkStatusLine}`
          log(`
            ${tracker.genStatusIdent(args.long)}:
            ${tracker.genStatusPeerCount()}
            ${args.live ? `| ${tracker.genStatusNetStats()}` : ''}
            - ${seedingStatusLine}
          `.split('\n').map(s => s.trim()).filter(Boolean).join(' '))
        }
      }
      updateStatusLine()

      // periodically calculate the size of the hyper structure
      const updateState = async () => {
        try {
          await tracker.fetchState()
          if (!args.live && tracker.loadStructPromise) {
            // if not live, we should wait until the struct finishes loading
            await tracker.loadStructPromise
          }
          if (tracker.struct) {
            ;({ mirror, network } = await getStatus(key, tracker.struct.type, tracker.struct.discoveryKey))
          }
        } catch (e) {
          if (e.toString().includes('RPC stream destroyed')) {
            // ignore
          } else {
            console.error(e)
          }
        }
        updateStatusLine()
        
        if (args.live) {
          // continuous update
          setTimeout(updateState, 1e3).unref()
        }
      }
      await updateState()
    }))

    if (!args.live) {
      process.exit(0)
    }

    async function getAllStatuses () {
      // TODO - --all switch
      // const allStatuses = await hyperClient.network.allStatuses()
      const allMirroring = await mirroringClient.list()
      allMirroring.forEach(s => {
        s.key = 'hyper://' + s.key
      })
      return [...allMirroring, /* ...allStatuses */]
    }

    async function getStatus (key, type, discoveryKey) {
      const mirror = await mirroringClient.status(key, type)
      const network = await hyperClient.network.status(discoveryKey)
      return {
        mirror,
        network
      }
    }
  }
}

async function getAllKeys (mirroringClient) {
  return (await mirroringClient.list()).map(s => s.key.toString('hex'))
}

function short(key) {
  return `${key.slice(0, 6)}..${key.slice(-2)}`
}
