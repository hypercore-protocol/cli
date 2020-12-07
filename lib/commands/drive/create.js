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
    console.log('Drive Created:')
    console.log(drive.url)
    console.log('')
    console.log('  Host with:')
    console.log('  hyp host', drive.url)
    console.log('')
    process.exit(0)
  }
}
