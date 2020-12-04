import { parse } from 'url'

const SCHEME_REGEX = /[a-z]+:\/\//i
//                   1          2      3        4
const VERSION_REGEX = /^(hyper:\/\/)?([^/]+)(\+[^/]+)(.*)$/i
export function parseHyperUrl (str, parseQS) {
  // prepend the scheme if it's missing
  if (!SCHEME_REGEX.test(str)) {
    str = 'hyper://' + str
  }

  var parsed, version = null, match = VERSION_REGEX.exec(str)
  if (match) {
    // run typical parse with version segment removed
    parsed = parse((match[1] || '') + (match[2] || '') + (match[4] || ''), parseQS)
    version = match[3].slice(1)
  } else {
    parsed = parse(str, parseQS)
  }
  parsed.href = str // overwrite href to include actual original
  if (!parsed.query && parsed.searchParams) {
    parsed.query = Object.fromEntries(parsed.searchParams) // to match node
  }
  parsed.version = version // add version segment
  if (!parsed.origin) parsed.origin = `hyper://${parsed.hostname}/`
  return parsed
}

export function urlToKey (url) {
  return Buffer.from(/([0-9a-f]{64})/i.exec(url)[1], 'hex')
}

export function fromURLToKeyStr (url) {
  try { 
    return /([0-9a-f]{64})/i.exec(url)[1]
  } catch (e) {
    throw new Error(`Invalid hyper:// URL, ${url}`)
  }
}

export function fromPathToHyperbeeKeyList (path) {
  var parts = path.split('/').filter(Boolean)
  return parts.map(part => decodeURIComponent(part))
}