import chalk from 'chalk'
import bytes from 'bytes'
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
      var struct = await HyperStruct.get(key)
      var stats = netStats.get(struct)
      var state = {size: undefined, total: undefined, downloaded: undefined}

      // periodically update stdout with the status-line
      const updateStatusLine = async () => {
        statusLines[i] = await genStatus(key, struct, stats, state)
        statusLog.print()
      }
      updateStatusLine()
      setInterval(updateStatusLine, 1e3).unref()

      // periodically calculate the size of the hyper structure
      const updateDownloadState = async () => {
        await calcState(struct, state)
        setTimeout(updateDownloadState, 1e3).unref()
      }
      updateDownloadState()
    })
  }
}

function short (key) {
  return `${key.slice(0, 6)}..${key.slice(-2)}`
}

async function genStatus (key, struct, stats, state) {
  var dl = bytes(stats.download[stats.download.length - 1], {unitSeparator: ' '})
  var ul = bytes(stats.upload[stats.download.length - 1], {unitSeparator: ' '})
  return `
    ${chalk.bold(short(key))}:
    ${getPeers(struct).length} connected |
    ${typeof state.total !== 'undefined'
      ? `${state.total ? Math.round(state.downloaded/state.total*100) : 100}% downloaded (${bytes(state.size)} total)`
      : 'Calculating...'}
    [↓${dl}/s ↑${ul}/s]
  `.split('\n').map(s => s.trim()).join(' ')
}

function getPeers (struct) {
  return (struct.api.metadata || struct.api.feed || struct.api).peers
}

async function calcState (struct, state) {
  if (struct.type === 'hyperdrive') {
    let [total, size, downloaded] = [0, 0, 0]
    let contentCore = await new Promise(resolve => struct.api.getContent((err, core) => resolve(core)))
    for (let entry of await struct.api.promises.readdir('/', {recursive: true, includeStats: true})) {
      total += entry.stat.blocks
      size += entry.stat.size
      downloaded += await countHasCoreBlocks(contentCore, entry.stat.offset, entry.stat.offset + entry.stat.blocks)
    }
    state.total = total
    state.size = size
    state.downloaded = downloaded
  } else if (struct.type === 'hyperbee') {
    state.downloaded = await struct.api.feed.downloaded()
    state.total = struct.api.feed.length
    state.size = struct.api.feed.byteLength
  } else {
    state.downloaded = await struct.api.downloaded()
    state.total = struct.api.length
    state.size = struct.api.byteLength
  }
}

async function countHasCoreBlocks (core, from, to) {
  var count = 0
  for (let i = from; i < to; i++) {
    count += (await core.has(i)) ? 1 : 0
  }
  return count
}