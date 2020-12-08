import * as p from 'path'
import { promises as fs } from 'fs'

import dft from 'diff-file-tree'
import chalk from 'chalk'
import yesno from 'yesno'
import * as HyperStruct from '../../hyper/struct.js'
import { statusLogger } from '../../status-logger.js'
import { parseHyperUrl } from '../../urls.js'

const FULL_USAGE = `
Options:

  --no-add - Don't include additions to the target location.
  --no-overwrite - Don't include overwrites to the target location.
  --no-delete - Don't include deletions to the target location.

Examples:

  hyp drive copy hyper://1234..af/ ./local-folder
  hyp drive copy ./local-folder hyper://1234..af/remote-folder --no-delete
  hyp drive copy hyper://1234..af/ hyper://fedc..21/
  hyp drive copy hyper://1234...af/
  hyp drive copy ./local-folder
`

export default {
  name: 'drive copy',
  description: 'Copy between two folders in your local filesystem or in hyperdrives.',
  usage: {
    simple: '{source_path_or_url} {target_path_or_url}',
    full: FULL_USAGE
  },
  options: [
    {name: 'add', default: true, boolean: true},
    {name: 'overwrite', default: true, boolean: true},
    {name: 'delete', default: true, boolean: true}
  ],
  command: async function (args) {
    if (!args._[0]) throw new Error('A source path or URL is required')

    var statusLines = ['Accessing network...']
    var statusLog = statusLogger(statusLines)
    statusLog.print()

    var leftArgs = await parseArgs(args._[0])
    var rightArgs = args._[1] ? await parseArgs(args._[1]) : await createTarget(leftArgs)

    var left = toDftParam(leftArgs)
    var right = toDftParam(rightArgs)

    statusLines[0] = 'Copying...'
    var diff = await dft.diff(left, right, {
      compareContent: false
    })

    if (!args.add || !args.overwrite || !args.delete) {
      diff = diff.filter(item => {
        if (item.change === 'add') return args.add
        if (item.change === 'mod') return args.overwrite
        if (item.change === 'del') return args.delete
        return false
      })
    }

    statusLog.clear()
    console.log('Source:', leftArgs.raw)
    console.log('Target:', rightArgs.raw)
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

    process.exit(0)
  }
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
    await fs.mkdir(target, { recursive: true })
    return { path: target, raw: target }
  }
  // If the source is a local directory, create a new drive to copy into.
  let drive = await HyperStruct.create('hyperdrive')
  return { fs: drive.api, path: '/', raw: drive.url + '/' }
}

function toDftParam ({ fs, path }) {
  return fs ? { fs, path } : path
}
