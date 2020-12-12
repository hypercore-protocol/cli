import chalk from 'chalk'
import hyperspace from 'hyperspace'
const HyperspaceClient = hyperspace.Client

const FULL_USAGE = `
Examples:

  hyp daemon status
`

export default {
  name: 'daemon status',
  description: 'Check the status of the hyperspace daemon.',
  usage: {
    simple: '',
    full: FULL_USAGE
  },
  command: async function (args) {
    try {
      let client = new HyperspaceClient()
      await client.ready()
      let st = await client.status()
      const versionString = st.version ? `v${st.version}` : '(Unknown Version)'
      console.error(chalk.bold(`Hyperspace ${versionString}`))
      console.error(chalk.bold(`Hyperspace API v${st.apiVersion}`))
      console.error(`Your address: ${st.remoteAddress} (${st.holepunchable ? 'Hole-punchable' : 'Not Hole-punchable'})`)
    } catch {
      console.error(`Daemon not active`)
    }

    process.exit(0)
  }
}
