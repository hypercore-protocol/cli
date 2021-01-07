import chalk from 'chalk'
import * as HyperStruct from '../hyper/struct.js'
import { getMirroringClient } from '../hyper/index.js'
import { parseHyperUrl } from '../urls.js'

const FULL_USAGE = `
Examples:

  hyp unseed hyper://1234..af/
  hyp unseed hyper://1234..af/ hyper:://fedc..21/
`

export default {
  name: 'unseed',
  description: 'Stop making hyper data available to the network.',
  usage: {
    simple: '{urls...}',
    full: FULL_USAGE
  },
  command: async function (args) {
    if (!args._[0]) throw new Error('At least URL is required')
    var mirroringClient = getMirroringClient()

    var keys = []
    for (let url of args._) {
      let urlp = parseHyperUrl(url)
      keys.push(urlp.hostname)
    }

    for (const key of keys) {
      var struct = await HyperStruct.get(key)
      await mirroringClient.unmirror(struct.key, struct.type)
      console.log(`No longer seeding ${chalk.bold(short(key))}`)
    }
    process.exit(0)
  }
}

function short (key) {
  return `${key.slice(0, 6)}..${key.slice(-2)}`
}
