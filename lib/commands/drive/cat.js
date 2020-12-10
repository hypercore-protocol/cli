import * as HyperStruct from '../../hyper/struct.js'
import { statusLogger } from '../../status-logger.js'
import { parseHyperUrl } from '../../urls.js'

const FULL_USAGE = `
Examples:

  hyp drive cat hyper://1234..af/index.html
`

export default {
  name: 'drive cat',
  description: 'Output the content of the given hyperdrive URL.',
  usage: {
    simple: '{url}',
    full: FULL_USAGE
  },
  command: async function (args) {
    if (!args._[0]) throw new Error('URL is required')

    var statusLog = statusLogger(['Accessing network...'])
    statusLog.print()

    var urlp =  parseHyperUrl(args._[0])
    var drive = await HyperStruct.get(urlp.hostname, {expect: 'hyperdrive'})

    if (process.stdout.isTTY) {
      let res = await drive.api.promises.readFile(urlp.pathname, 'utf8')
      statusLog.clear()
      console.log(res)
      process.exit(0)
    } else {
      let out = drive.api.createReadStream(urlp.pathname)
      out.on('error', err => {
        statusLog.clear()
        console.error(err)
        process.exit(1)
      })
      out.on('end', () => {
        statusLog.clear()
        process.exit(0)
      })
      out.pipe(process.stdout)
    }
  }
}
