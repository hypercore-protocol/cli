#!/usr/bin/env node

import subcommand from 'subcommand'
import fs from 'fs'

import * as hyper from '../lib/hyper/index.js'

import driveCreateCmd from '../lib/commands/drive/create.js'
import driveLsCmd from '../lib/commands/drive/ls.js'
import driveCatCmd from '../lib/commands/drive/cat.js'
import driveHttpCmd from '../lib/commands/drive/http.js'

import beeCreateCmd from '../lib/commands/bee/create.js'
import beeLsCmd from '../lib/commands/bee/ls.js'
import beeGetCmd from '../lib/commands/bee/get.js'
import beePutCmd from '../lib/commands/bee/put.js'
import beeDelCmd from '../lib/commands/bee/del.js'

import usage from '../lib/usage.js'

// main
// =

var commands = [
  driveCreateCmd,
  driveLsCmd,
  driveCatCmd,
  driveHttpCmd,

  beeCreateCmd,
  beeLsCmd,
  beeGetCmd,
  beePutCmd,
  beeDelCmd
].map(wrapCommand)

// match & run the command
var match = subcommand({ commands, none })
match(process.argv.slice(2))

// error output when no/invalid command is given
function none (args) {
  if (args.version) {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
    console.log(packageJson.version)
    process.exit(0)
  }
  var err = (args._[0]) ? `Invalid command: ${args._[0]}` : false
  usage(err)
}

function wrapCommand (obj) {
  var innerCommand = obj.command

  obj.command = async function (...args) {
    try {
      await hyper.setup()
      await innerCommand(...args)
    } catch (err) {
      usage(err)
      process.exit(1)
    }
  }
  return obj
}