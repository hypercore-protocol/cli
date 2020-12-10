import chalk from 'chalk'
import { statusLogger } from '../status-logger.js'
import { parseHyperUrl } from '../urls.js'
import { HyperStructInfoTracker } from '../hyper/info-tracker.js'

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

function short (key) {
  return `${key.slice(0, 6)}..${key.slice(-2)}`
}