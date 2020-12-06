import * as HyperStruct from '../../hyper/struct.js'
import { statusLogger } from '../../status-logger.js'
import { parseHyperUrl } from '../../urls.js'

const FULL_USAGE = `
Examples:

  hyp drive mkdir hyper://1234..af/foldername
`

export default {
  name: 'drive mkdir',
  description: 'Create a new directory at the given hyperdrive URL.',
  usage: {
    simple: '{url}',
    full: FULL_USAGE
  },
  command: async function (args) {
    if (!args._[0]) throw new Error('URL is required')

    var statusLog = statusLogger(['Accessing network...'])
    statusLog.print()

    var urlp =  parseHyperUrl(args._[0])
    if (!urlp.pathname || urlp.pathname === '/') {
      throw new Error('Root folder already exists')
    }
    var drive = await HyperStruct.get(urlp.hostname, {expect: 'hyperdrive'})
    await drive.api.promises.mkdir(urlp.pathname || '/')

    statusLog.clear()
    console.log(`${urlp.pathname} created`)
    process.exit(0)
  }
}
