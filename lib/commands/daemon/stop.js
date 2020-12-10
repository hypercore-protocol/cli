import chalk from 'chalk'
import hyperspace from 'hyperspace'
const HyperspaceClient = hyperspace.Client

const FULL_USAGE = `
Examples:

  hyp daemon stop
`

export default {
  name: 'daemon stop',
  description: 'Stop the hyperspace daemon if active.',
  usage: {
    simple: '',
    full: FULL_USAGE
  },
  command: async function (args) {
    var client
    try {
      client = new HyperspaceClient()
      await client.ready()
    } catch {
      console.error('Daemon not active')
      process.exit(0)
    }

    try {
      await client.stop()
      console.error('Daemon stopped')
    } catch (e) {
      console.error('Failed to stop daemon')
      console.error(e)
    }

    process.exit(0)
  }
}