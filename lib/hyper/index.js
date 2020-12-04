import HyperspaceClient from '@hyperspace/client'
import hyperdrive from 'hyperdrive'
import { urlToKey, parseHyperUrl } from '../urls.js'

var hyperClient
var activeDrives = {}

export async function createClient () {
  var hclient
  const cleanup = async () => {
    if (hclient) await hclient.close()
  }
  process.once('SIGINT', cleanup)
  process.once('SIGTERM', cleanup)

  hclient = new HyperspaceClient()
  await hclient.ready()
  return hclient
}

export async function readdir (url, opts) {
  var urlp = parseHyperUrl(url)
  var drive = await getOrLoadDrive(urlp.hostname)
  return drive.promises.readdir(urlp.pathname || '/', opts)
}

export async function readFile (url, opts) {
  var urlp = parseHyperUrl(url)
  var drive = await getOrLoadDrive(urlp.hostname)
  return drive.promises.readFile(urlp.pathname, opts)
}

async function loadDrive (url) {
  if (!hyperClient) {
    hyperClient = await createClient()
  }
  const key = urlToKey(url)
  return hyperdrive(hyperClient.corestore(), key, {sparse: true, extension: false})
}

export async function getOrLoadDrive (url) {
  if (activeDrives[url]) return activeDrives[url]
  activeDrives[url] = /* dont await */ loadDrive(url)
  return activeDrives[url]
}