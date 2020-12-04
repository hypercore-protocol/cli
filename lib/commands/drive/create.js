import * as HyperStruct from '../../hyper/struct.js'

export default {
  name: 'drive create',
  command: async function (args) {
    var drive = await HyperStruct.create('hyperdrive')
    console.log('Drive Created:')
    console.log(drive.url)
    process.exit(0)
  }
}
