import pump from 'pump'
import concat from 'concat-stream'
import * as HyperStruct from '../../hyper/struct.js'
import { parseHyperUrl, fromPathToHyperbeeKeyList } from '../../urls.js'

export default {
  name: 'bee put',
  command: async function (args) {
    try {
      if (!args._[0]) throw new Error('URL is required')
      var urlp = parseHyperUrl(args._[0])

      try {
        var value
        if (!process.stdin.isTTY) {
          value = await new Promise((resolve, reject) => {
            pump(
              process.stdin,
              concat(res => resolve(res)),
              err => {
                if (err) reject(err)
              }
            )
          })
          value = value.toString('utf8')
          if (value.endsWith('\n')) value = value.slice(0, -1)
          try { value = JSON.parse(value) }
          catch {}
        } else {
          value = args._[1]
          if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
            console.log('Warning: JSON objects must be piped via STDIN')
          }
        }
      } catch (e) {
        console.error(e)
        throw e
      }

      if (typeof value === 'undefined') {
        console.error('A value is required. Can be parameter in the CLI or a stream via STDIN')
        process.exit()
      }

      var bee = await HyperStruct.get(urlp.hostname, {expect: 'hyperbee'})

      var path = fromPathToHyperbeeKeyList(urlp.pathname)
      var keyspace = bee.api
      for (let i = 0; i < path.length - 1; i++) {
        keyspace = keyspace.sub(path[i])
      }
      await keyspace.put(path[path.length - 1], value)
      
      console.log(urlp.pathname, 'written, type is', typeof value)
    } catch (e) {
      console.error('Unexpected error', e)
    } finally {
      process.exit(0)
    }
  }
}
