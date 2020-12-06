import pump from 'pump'
import concat from 'concat-stream'
import * as HyperStruct from '../../hyper/struct.js'
import { parseHyperUrl, fromPathToHyperbeeKeyList } from '../../urls.js'

const FULL_USAGE = `
Examples:

  hyp bee put hyper://1234..af/foo "hello"
  hyp bee put hyper://1234..af/foo/bar 12345
  cat data.json | hyp bee put hyper://1234..af/data
`

export default {
  name: 'bee put',
  description: 'Set the value of an entry of the given hyperbee URL.',
  usage: {
    simple: '{url} [value]',
    full: FULL_USAGE
  },
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
