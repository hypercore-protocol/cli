import p from 'path'
import { createRequire } from 'module'
import { spawn } from 'child_process'
import hyperspace from 'hyperspace'
import mirroring from 'hyperspace-mirroring-service'
const HyperspaceClient = hyperspace.Client
const MirroringClient = mirroring.Client

const NUM_RETRIES = 50
const RETRY_DELAY = 100

var clients = new Map()
var running = new Set()

export async function setup ({canStartDaemon} = {canStartDaemon: false}) {
  await setupClient('hyperspace', 'Hyperspace', () => new HyperspaceClient(), canStartDaemon)
  await setupClient('hyperspace-mirroring-service', 'Mirroring', () => new MirroringClient(), canStartDaemon)
}

async function setupClient (name, readable, clientFunc, canStartDaemon = false) {
  let retries = 0
  while (!clients.get(name) && retries++ < NUM_RETRIES) {
    try {
      const client = clientFunc()
      await client.ready()
      clients.set(name, client)
    } catch {
      if (!canStartDaemon) break
      if (!running.has(name)) {
        await startDaemon(name, readable)
        running.add(name)
      }
      await wait(RETRY_DELAY * retries)
    }
  }
  if (!clients.has(name)) {
    throw new Error(`Could not connect to the ${readable} daemon.`)
  }

  const cleanup = async () => {
    const client = clients.get(name)
    if (client) await client.close()
  }
  process.once('SIGINT', cleanup)
  process.once('SIGTERM', cleanup)
}

async function startDaemon (name, readable) {
  const require = createRequire(import.meta.url)
  const daemonRoot = p.dirname(require.resolve(name))
  const binPath = p.join(daemonRoot, 'bin', 'index.js')
  console.error(`${readable} daemon started`)
  return spawn('node', [binPath], {
    detached: true
  })
}

function wait (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getClient () {
  return clients.get('hyperspace')
}

export function getMirroringClient () {
  return clients.get('hyperspace-mirroring-service')
}
