import pump from 'pump'
import concat from 'concat-stream'
import * as HyperStruct from '../../hyper/struct.js'
import { parseHyperUrl } from '../../urls.js'

const FULL_USAGE = `
Examples:

  hyp drive put hyper://1234..af/hello.txt "Hello world!"
  cat package.json | hyp drive put hyper://1234..af/package.json
  cat photo.png | hyp drive put hyper://1234..af/photo.png
`

export default {
  name: 'drive put',
  description: 'Write a file at the given hyperdrive URL.',
  usage: {
    simple: '{url} [content]',
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

      if (!urlp.pathname || urlp.pathname === '/') {
        throw new Error('Cannot write a file to the root folder')
      }

      var drive = await HyperStruct.get(urlp.hostname, {expect: 'hyperdrive'})
      await drive.api.promises.writeFile(urlp.pathname, value)
      console.log(urlp.pathname, 'written')
    } catch (e) {
      console.error('Unexpected error', e)
    } finally {
      process.exit(0)
    }
  }
}
