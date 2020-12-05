import * as HyperStruct from '../../hyper/struct.js'

export default {
  name: 'bee create',
  description: 'Create a new hyperbee.',
  usage: {
    simple: '',
    full: ''
  },
  command: async function (args) {
    var bee = await HyperStruct.create('hyperbee')
    console.log('Bee Created:')
    console.log(bee.url)
    process.exit(0)
  }
}
