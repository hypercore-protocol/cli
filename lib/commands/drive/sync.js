import * as p from 'path'
import { promises as fs } from 'fs'

import dft from 'diff-file-tree'
import chalk from 'chalk'
import yesno from 'yesno'
import chokidar from 'chokidar'
import debounce from 'p-debounce'
import * as HyperStruct from '../../hyper/struct.js'
import { statusLogger } from '../../status-logger.js'
import { parseHyperUrl } from '../../urls.js'

const SYNC_INTERVAL = 1000
const FULL_USAGE = `
Options:

  --no-add - Don't include additions to the target location.
  --no-overwrite - Don't include overwrites to the target location.
  --no-delete - Don't include deletions to the target location.
  --no-live - Don't continuously sync changes.

Examples:

  hyp drive sync hyper://1234..af/ ./local-folder
  hyp drive sync ./local-folder hyper://1234..af/remote-folder --no-delete
  hyp drive sync hyper://1234..af/ hyper://fedc..21/
  hyp drive sync hyper://1234...af/
  hyp drive sync ./local-folder
`

export default {
  name: 'drive sync',
  description: 'Continuously sync changes between two folders in your local filesystem or in hyperdrives.',
  usage: {
    simple: '{source_path_or_url} {target_path_or_url}',
    full: FULL_USAGE
  },
  options: [
    {name: 'add', default: true, boolean: true},
    {name: 'overwrite', default: true, boolean: true},
    {name: 'delete', default: true, boolean: true},
    {name: 'live', default: true, boolean: true}
  ],
  command: async function (args) {
    if (!args._[0]) throw new Error('A source path or URL is required')

    var statusLog = statusLogger([args.live ? 'Live syncing (Ctrl+c to exit)...' : 'Syncing...'])
    statusLog.print()

    var leftArgs = await parseArgs(args._[0])
    var rightArgs = args._[1] ? await parseArgs(args._[1]) : await createTarget(leftArgs)
    console.log(chalk.blue(chalk.bold(`Source: ${leftArgs.raw}`)))
    console.log(chalk.blue(chalk.bold(`Target: ${rightArgs.raw}`)))

    var left = toDftParam(leftArgs)
    var right = toDftParam(rightArgs)

    await sync(left, right, args)
    if (!args.live) return process.exit(0)

    const watcher = watch(left, debounce(() => sync(left, right, args), SYNC_INTERVAL))
    let exiting = false

    process.on('SIGINT', cleanup)
    process.on('SIGTERM', cleanup)

    async function cleanup () {
      if (exiting) return
      console.log('Exiting...')
      exiting = true
      if (watcher.close) await watcher.close()
      else if (watcher.destroy) watcher.destroy()
      process.exit(0)
    }
  }
}

function watch (source, onchange) {
  if (source.fs) return source.fs.watch(source.path, onchange)
  const watcher = chokidar.watch(source, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinished: true
  })
  watcher.on('add', onchange)
  watcher.on('change', onchange)
  watcher.on('unlink', onchange)
  return watcher
}

async function sync (left, right, opts = {}) {
  var diff = await dft.diff(left, right, {
    compareContent: false
  })

  if (!opts.add || !opts.overwrite || !opts.delete) {
    diff = diff.filter(item => {
      if (item.change === 'add') return opts.add
      if (item.change === 'mod') return opts.overwrite
      if (item.change === 'del') return opts.delete
      return false
    })
  }

  for (let item of diff) {
    let path = item.type === 'dir' ? item.path + '/' : item.path
    if (item.change === 'add') {
      console.log(chalk.green(`  ${chalk.bold('Add:')} ${path}`))
    } else if (item.change === 'del') {
      console.log(chalk.red(`  ${chalk.bold('Delete:')} ${path}`))
    } else {
      console.log(`  ${chalk.bold('Change:')} ${path}`)
    }
  }
  if (diff.length === 0) {
    console.log('  No differences found.')
  }

  await dft.applyRight(left, right, diff)
}

function isUrl (str) {
  return str.startsWith('hyper://') || /^[0-9a-f]{64}/.test(str)
}

async function parseArgs (str) {
  if (isUrl(str)) {
    let urlp = parseHyperUrl(str)
    let drive = await HyperStruct.get(urlp.hostname, {expect: 'hyperdrive'})
    return { fs: drive.api, path: urlp.pathname, url: urlp, raw: str }
  }
  return { path: ''+str, raw: str }
}

async function createTarget (source) {
  if (source.url) {
    // If the source is a drive, create a new output directory with the drive key's name.
    let target = p.join(process.cwd(), source.url.hostname)
    await fs.mkdir(target, {recursive: true})
    return {path: target, raw: target}
  }
  // If the source is a local directory, create a new drive to copy into.
  let drive = await HyperStruct.create('hyperdrive')
  return {fs: drive.api, path: '/', raw: drive.url + '/'}
}

function toDftParam ({fs, path}) {
  return fs ? {fs, path} : path
}
