import dft from 'diff-file-tree'
import chalk from 'chalk'
import yesno from 'yesno'
import * as HyperStruct from '../../hyper/struct.js'
import { statusLogger } from '../../status-logger.js'
import { parseHyperUrl } from '../../urls.js'

const FULL_USAGE = `
Options:

  -c/--commit - Write the differences to the target location.

  --no-add - Don't include additions to the target location.
  --no-overwrite - Don't include overwrites to the target location.
  --no-delete - Don't include deletions to the target location.

Examples:

  hyp drive diff hyper://1234..af/ ./local-folder
  hyp drive diff ./local-folder hyper://1234..af/remote-folder --no-delete
  hyp drive diff hyper://1234..af/ hyper://fedc..21/ --commit
`

export default {
  name: 'drive diff',
  description: 'Compare two folders in your local filesystem or in hyperdrives. Can optionally "commit" the difference.',
  usage: {
    simple: '{source_path_or_url} {target_path_or_url}',
    full: FULL_USAGE
  },
  options: [
    {name: 'add', default: true, boolean: true},
    {name: 'overwrite', default: true, boolean: true},
    {name: 'delete', default: true, boolean: true},
    {name: 'commit', default: false, boolean: true, abbr: 'c'}
  ],
  command: async function (args) {
    if (!args._[0]) throw new Error('A source path or URL is required')
    if (!args._[1]) throw new Error('A destination path or URL is required')

    var statusLines = ['Accessing network...']
    var statusLog = statusLogger(statusLines)
    statusLog.print()

    var left = await toDftParam(args._[0])
    var right = await toDftParam(args._[1])

    statusLines[0] = 'Comparing...'
    var diff = await dft.diff(left, right)

    if (!args.add || !args.overwrite || !args.delete) {
      diff = diff.filter(item => {
        if (item.change === 'add') return args.add
        if (item.change === 'mod') return args.overwrite
        if (item.change === 'del') return args.delete
        return false
      })
    }

    statusLog.clear()
    console.log('Source:', args._[0])
    console.log('Target:', args._[1])
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

    if (args.commit) {
      let ok = await yesno({
        question: `Commit these changes? [y/N]`,
        defaultValue: false
      })
      if (ok) {
        console.log('Committing...')
        await dft.applyRight(left, right, diff)
        console.log('Done')
      }
    }

    process.exit(0)
  }
}

function isUrl (str) {
  return str.startsWith('hyper://') || /^[0-9a-f]{64}/.test(str)
}

async function toDftParam (str) {
  if (isUrl(str)) {
    let urlp = parseHyperUrl(str)
    let drive = await HyperStruct.get(urlp.hostname, {expect: 'hyperdrive'})
    return {fs: drive.api, path: urlp.pathname}
  }
  return ''+str
}