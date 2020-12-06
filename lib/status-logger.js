/**
 * https://github.com/joehand/status-logger
 * Copyright Joe Hand 2017
 * MIT License
 * 
 * modified to output to stderr -pfrazee
 */

import differ from 'ansi-diff-stream'
import wrapAnsi from 'wrap-ansi'

export function statusLogger (messages, opts) {
  if (!Array.isArray(messages[0])) messages = [messages]
  if (!opts) opts = {}

  var logger = {}
  logger.messages = logger.groups = messages // groups = v2 backwards compat
  logger.diff = differ()
  logger.clear = clear
  logger.print = print

  if (!opts.debug && !opts.quiet) {
    logger.diff.pipe(process.stderr)
    process.stderr.on('resize', function () {
      logger.diff.reset()
    })
  }

  return logger

  function print (lines) {
    var output = lines || logger.messages
    var msg = wrapAnsi(output.flat().join('\n'), process.stderr.columns - 1, {hard: true})
    if (opts.debug) console.log(msg)
    else if (!opts.quiet) logger.diff.write(msg)
  }

  function clear (newLines) {
    logger.messages = newLines || []
    logger.diff.clear()
    return logger.messages
  }
}