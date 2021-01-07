import * as HyperStruct from '../hyper/struct.js'
import { getMirroringClient } from '../hyper/index.js'

export default {
  name: 'create',
  description: 'Create a new hyperdrive or hyperbee.',
  usage: {
    simple: '{drive|bee}',
    full: ''
  },
  command: async function (args) {
    var struct
    if (args._[0] === 'drive' || args._[0] === 'hyperdrive') {
      struct = await HyperStruct.create('hyperdrive')
      console.error('Drive Created:', struct.url)
    } else if (args._[0] === 'bee' || args._[0] === 'hyperbee') {
      struct = await HyperStruct.create('hyperbee')
      console.error('Bee Created:', struct.url)
    } else {
      if (args._[0]) console.error('Unknown type:', args._[0], '- must be a "drive" or "bee".')
      else console.error('What do you want to create? Can be a "drive" or "bee".')
      process.exit(1)
    }

    await getMirroringClient().mirror(struct.key, struct.type)
    console.log('Seeding', struct.type)
    process.exit(0)
  }
}
