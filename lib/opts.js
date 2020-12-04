import path from 'path'

const HYPER_URL_REGEX = /^(hyper:\/\/)?([0-9a-f]{64})/i

export function parseHyperUrl (url) {
  return HYPER_URL_REGEX.exec(url)
}

export function isHyperUrl (url) {
  return !!parseHyperUrl(url)
}

export async function hyperurlOpt (arg) {
  if (arg) {
    var match = HYPER_URL_REGEX.exec(arg)
    if (match) return `hyper://${match[2]}`
  }
}

export function dirOpt (arg) {
  if (arg) {
    if (!path.isAbsolute(arg)) return path.resolve(process.cwd(), arg)
    return arg
  }
  return process.cwd()
}

export function hyperurlToKey (url) {
  var match = HYPER_URL_REGEX.exec(url)
  return match && match[2]
}