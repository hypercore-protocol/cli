import * as HyperStruct from '../../hyper/struct.js'
import statusLogger from 'status-logger'
import { parseHyperUrl } from '../../urls.js'

export default {
  name: 'drive ls',
  command: async function (args) {
    if (!args._[0]) throw new Error('URL is required')

    var statusLog = statusLogger(['Accessing network...'])
    statusLog.print()

    var urlp =  parseHyperUrl(args._[0])
    var drive = await HyperStruct.get(urlp.hostname, {expect: 'hyperdrive'})
    var res = await drive.api.promises.readdir(urlp.pathname || '/')

    statusLog.clear()
    console.log(res.join('\n'))

    process.exit(0)
  }
}
