#!/usr/bin/env node

import subcommand from 'subcommand'
import fs from 'fs'

import * as hyper from '../lib/hyper/index.js'

import driveCreate from '../lib/commands/drive/create.js'
import driveLs from '../lib/commands/drive/ls.js'
import driveCat from '../lib/commands/drive/cat.js'
import driveMkdir from '../lib/commands/drive/mkdir.js'
import driveRmdir from '../lib/commands/drive/rmdir.js'
import drivePut from '../lib/commands/drive/put.js'
import driveRm from '../lib/commands/drive/rm.js'
import driveHttp from '../lib/commands/drive/http.js'

import beeCreate from '../lib/commands/bee/create.js'
import beeLs from '../lib/commands/bee/ls.js'
import beeGet from '../lib/commands/bee/get.js'
import beePut from '../lib/commands/bee/put.js'
import beeDel from '../lib/commands/bee/del.js'

import usage from '../lib/usage.js'

// main
// =

var commands = {
  driveCreate,
  driveLs,
  driveCat,
  driveMkdir,
  driveRmdir,
  drivePut,
  driveRm,
  driveHttp,

  beeCreate,
  beeLs,
  beeGet,
  beePut,
  beeDel
}

// match & run the command
var match = subcommand({ commands: Object.values(commands).map(wrapCommand), none })
match(process.argv.slice(2))

// error output when no/invalid command is given
function none (args) {
  if (args.version) {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
    console.log(packageJson.version)
    process.exit(0)
  }
  var err = (args._[0]) ? `Invalid command: ${args._[0]}` : false
  usage(commands, err)
}

function wrapCommand (obj) {
  var innerCommand = obj.command

  obj.command = async function (...args) {
    if (args[0].h || args[0].help) {
      usage(commands, null, obj)
      process.exit(0)
    }

    try {
      await hyper.setup()
      await innerCommand(...args)
    } catch (err) {
      usage(commands, err, obj)
      process.exit(1)
    }
  }
  return obj
}