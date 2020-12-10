import chalk from 'chalk'
import { getClient, getMirroringClient } from '../hyper/index.js'
import { statusLogger } from '../status-logger.js'
import { parseHyperUrl } from '../urls.js'
import { HyperStructInfoTracker } from '../hyper/info-tracker.js'

const FULL_USAGE = `
Examples:

  hyp info
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
  command: async function (args) {
    var hyperClient = getClient()
    var mirroringClient = getMirroringClient()

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
      console.error(`No hypers active.`)
      process.exit(0)
    }

    var statusLines = keys.map(k => `${chalk.bold(short(k))}: Loading...`)
    var statusLog = statusLogger(statusLines)
    statusLog.print()

    keys.forEach(async (key, i) => {
      var tracker = new HyperStructInfoTracker(key)
      await tracker.attemptLoadStruct()
      var mirror = null
      var network = null

      // periodically update stdout with the status-line
      const updateStatusLine = () => {
        const networkStatusLine = network && network.announce ? 'but online (announcing)' : 'and not online'
        const seedingStatusLine = mirror && mirror.mirroring ? 'Seeding' : `Not seeding ${networkStatusLine}`
        statusLines[i] = `${tracker.genStatusLine()} - ${seedingStatusLine}`
        statusLog.print()
      }
      updateStatusLine()
      setInterval(updateStatusLine, 1e3).unref()

      // periodically calculate the size of the hyper structure
      const updateState = async () => {
        if (tracker.struct) {
          ;({ mirror, network } = await getStatus(key, tracker.struct.type, tracker.struct.api.discoveryKey))
        }
        await tracker.fetchState().catch(console.error)
        setTimeout(updateState, 1e3).unref()
      }
      updateState()
    })

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
