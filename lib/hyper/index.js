import p from 'path'
import { createRequire } from 'module'
import { spawn } from 'child_process'
import hyperspace from 'hyperspace'
const HyperspaceClient = hyperspace.Client

const NUM_RETRIES = 5
const RETRY_DELAY = 100

var hyperClient
var startedDaemon = false

export async function setup () {
  let retries = 0
  while (!hyperClient && retries++ < NUM_RETRIES) {
    try {
      const client = new HyperspaceClient()
      await client.ready()
      hyperClient = client
    } catch {
      if (!startedDaemon) {
        await startDaemon()
        startedDaemon = true
      }
      await wait(RETRY_DELAY * retries)
    }
  }
  if (!hyperClient) throw new Error('Could not connect to the Hyperspace daemon.')

  const cleanup = async () => {
    if (hyperClient) await hyperClient.close()
  }
  process.once('SIGINT', cleanup)
  process.once('SIGTERM', cleanup)
}

async function startDaemon () {
  const require = createRequire(import.meta.url)
  const hyperspaceRoot = p.dirname(require.resolve('hyperspace'))
  const binPath = p.join(hyperspaceRoot, 'bin', 'index.js')
  return spawn(binPath, {
    detached: true
  })
}

function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getClient () {
  return hyperClient
}
