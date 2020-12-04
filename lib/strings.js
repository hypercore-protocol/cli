import chalk from 'chalk'
import prettyHash from 'pretty-hash'
import moment from 'moment'
import { hyperurlToKey } from './opts.js'

// template tag
export function trim (strings, ...values) {
  var str = String.raw(strings, ...values)
  return str.replace(/^([ ]+)/gm, '').replace(/([ ]+)$/gm, '')
}

export function niceUrl (url, shorten=true) {
  if (shorten) {
    var key = hyperurlToKey(url)
    url = 'hyper://' + prettyHash(key)
  }
  return chalk.gray(url)
}

export function niceDate (ts, opts) {
  const endOfToday = moment().endOf('day')
  if (typeof ts == 'number')
    ts = moment(ts)
  if (ts.isSame(endOfToday, 'day')) {
    if (opts && opts.noTime)
      return 'today'
    return ts.fromNow()
  }
  else if (ts.isSame(endOfToday.subtract(1, 'day'), 'day'))
    return 'yesterday'
  else if (ts.isSame(endOfToday, 'month'))
    return ts.fromNow()
  return ts.format("ll")
}

export function normalizeUrl (url) {
  return (url||'').replace(/(\/)*$/, '') // strip trailing slash
}