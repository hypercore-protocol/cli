import chalk from 'chalk'

export default function usage (commands, err, cmd) {
  if (err) { 
    console.log(chalk.red(`${err}\n`))
  } else {
    console.log('')
  }

  if (cmd) {
    console.log(simple(cmd))
    if (cmd.usage.full) console.log(cmd.usage.full)
    console.log('')
    process.exit(err ? 1 : 0)
  }

  console.log(`Usage: ${chalk.bold(`hk`)} <command> ${chalk.gray(`[opts...]`)}

${chalk.bold(`Hyperdrive Commands:`)}

  ${simple(commands.driveCreate)}

  ${simple(commands.driveLs)}
  ${simple(commands.driveMkdir)}
  ${simple(commands.driveRmdir)}

  ${simple(commands.driveCat)}
  ${simple(commands.drivePut)}

  ${simple(commands.driveHttp)}

${chalk.bold(`Hyperbee Commands:`)}

  ${simple(commands.beeCreate)}

  ${simple(commands.beeLs)}
  ${simple(commands.beeGet)}
  ${simple(commands.beePut)}
  ${simple(commands.beeDel)}

  ${chalk.green(`Learn more at https://github.com/hypecore-protocol/hyperkit`)}
`)
  process.exit(err ? 1 : 0)
}

function simple (cmd) {
  return `${chalk.bold(`hk ${cmd.name}`)} ${cmd.usage.simple ? `${cmd.usage.simple} -` : `-`} ${cmd.description}`
}

// TODO
// ${chalk.bold(`hk ${commands.driveDiff.name}`)} {path_or_url} {path_or_url} - Diff two locations against each other.
// ${chalk.bold(`hk ${commands.driveMirror.name}`)} {path_or_url} {path_or_url} ${chalk.gray(`[-w|--watch]`)} - Rewrite the right location to mirror the left location.