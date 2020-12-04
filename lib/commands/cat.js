import { readFile } from '../hyper/index.js'
import statusLogger from 'status-logger'

export default {
  name: 'cat',
  command: async function (args) {
    if (!args._[0]) throw new Error('URL is required')

    var statusLog = statusLogger(['Accessing network...'])
    statusLog.print()

    var res = await readFile(args._[0], 'utf8')

    statusLog.clear()
    console.log(res)
    process.exit(0)
  }
}
