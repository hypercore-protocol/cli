import * as HyperStruct from '../../hyper/struct.js'
import statusLogger from 'status-logger'
import pump from 'pump'
import concat from 'concat-stream'
import { parseHyperUrl } from '../../urls.js'
import { keyToPath } from '../../hyperbee-util.js'

const FULL_USAGE = `
Options:

  --gt {key} - Filter to items with a key greater than the given value.
  --gte {key} - Filter to items with a key greater than or equal to the given value.
  --lt {key} - Filter to items with a key less than the given value.
  --lte {key} - Filter to items with a key less than or equal to the given value.

Examples:

  hk bee ls hyper://1234..af/
  hk bee ls hyper://1234..af/foo/bar
  hk bee ls hyper://1234..af/ --gte a --lt m
`

export default {
  name: 'bee ls',
  description: 'List the entries of the given hyperbee URL.',
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
    var res = await new Promise((resolve, reject) => {
      pump(
        bee.api.createReadStream(),
        concat(res => resolve(res)),
        err => {
          if (err) reject(err)
        }
      )
    })

    statusLog.clear()
    console.log(res.map(entry =>
      `/${keyToPath(entry.key)} = ${JSON.stringify(entry.value, null, 2)}`
    ).join('\n'))

    process.exit(0)
  }
}