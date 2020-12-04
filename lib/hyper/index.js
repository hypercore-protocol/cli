import HyperspaceClient from '@hyperspace/client'

var hyperClient

export async function setup () {
  const cleanup = async () => {
    if (hyperClient) await hyperClient.close()
  }
  process.once('SIGINT', cleanup)
  process.once('SIGTERM', cleanup)

  hyperClient = new HyperspaceClient()
  await hyperClient.ready()
}

export function getClient () {
  return hyperClient
}