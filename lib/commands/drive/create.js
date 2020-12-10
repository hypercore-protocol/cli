import * as HyperStruct from '../../hyper/struct.js'

export default {
  name: 'drive create',
  description: 'Create a new hyperdrive.',
  usage: {
    simple: '',
    full: ''
  },
  command: async function (args) {
    var drive = await HyperStruct.create('hyperdrive')
    console.log('Drive Created:', drive.url)
    process.exit(0)
  }
}
