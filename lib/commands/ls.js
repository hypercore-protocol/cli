import { readdir } from '../hyper/index.js'
import statusLogger from 'status-logger'

export default {
  name: 'ls',
  command: async function (args) {
    if (!args._[0]) throw new Error('URL is required')

    var statusLog = statusLogger(['Accessing network...'])
    statusLog.print()

    var res = await readdir(args._[0])

    statusLog.clear()
    console.log(res.join('\n'))

    process.exit(0)
  }
}
