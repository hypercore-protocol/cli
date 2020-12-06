import * as HyperStruct from '../../hyper/struct.js'
import { statusLogger } from '../../status-logger.js'
import { fromPathToHyperbeeKeyList, parseHyperUrl } from '../../urls.js'

const FULL_USAGE = `
Examples:

  hyp bee del hyper://1234..af/foo
  hyp bee del hyper://1234..af/foo/bar
`

export default {
  name: 'bee del',
  description: 'Delete an entry of the given hyperbee URL.',
  usage: {
    simple: '{url}',
    full: FULL_USAGE
  },
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
