import * as HyperStruct from '../hyper/struct.js'

export default {
  name: 'create',
  description: 'Create a new hyperdrive or hyperbee.',
  usage: {
    simple: '{drive|bee}',
    full: ''
  },
  command: async function (args) {
    if (args._[0] === 'drive' || args._[0] === 'hyperdrive') {
      let drive = await HyperStruct.create('hyperdrive')
      console.error('Drive Created:', drive.url)
      process.exit(0)
    } else if (args._[0] === 'bee' || args._[0] === 'hyperbee') {
      let bee = await HyperStruct.create('hyperbee')
      console.error('Bee Created:', bee.url)
      process.exit(0)
    } else {
      if (args._[0]) console.error('Unknown type:', args._[0], '- must be a "drive" or "bee".')
      else console.error('What do you want to create? Can be a "drive" or "bee".')
      process.exit(1)
    }
  }
}
