import * as HyperStruct from '../../hyper/struct.js'
import statusLogger from 'status-logger'
import pump from 'pump'
import concat from 'concat-stream'
import { parseHyperUrl } from '../../urls.js'
import { keyToPath } from '../../hyperbee-util.js'

export default {
  name: 'bee ls',
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