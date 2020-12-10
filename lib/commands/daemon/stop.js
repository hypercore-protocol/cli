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
    for (let i = 0; i < 10; i++) {
      var client
      try {
        client = new HyperspaceClient()
        await client.ready()
      } catch {
        console.error('Daemon stopped')
        process.exit(0)
      }

      if (i === 0) {
        console.error('Attempting to stop daemon...')
      }
      await client.stop()
      await new Promise(r => setTimeout(r, 1e3))
    }
    process.exit(0)
  }
}