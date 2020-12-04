import * as HyperStruct from '../../hyper/struct.js'
import statusLogger from 'status-logger'
import { fromPathToHyperbeeKeyList, parseHyperUrl } from '../../urls.js'

export default {
  name: 'bee del',
  command: async function (args) {
    if (!args._[0]) throw new Error('URL is required')

    var statusLog = statusLogger(['Accessing network...'])
    statusLog.print()

    var urlp = parseHyperUrl(args._[0])
    var bee = await HyperStruct.get(urlp.hostname, {expect: 'hyperbee'})

    var path = fromPathToHyperbeeKeyList(urlp.pathname)
    var keyspace = bee.api
    for (let i = 0; i < path.length - 1; i++) {
      keyspace = keyspace.sub(path[i])
    }
    await keyspace.del(path[path.length - 1])

    statusLog.clear()
    console.log(`/${path.map(encodeURIComponent).join('/')} has been deleted`)

    process.exit(0)
  }
}
