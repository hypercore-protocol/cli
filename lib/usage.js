import chalk from 'chalk'

export default function usage (commands, err, cmd) {
  if (err) { 
    console.error(chalk.red(`${err}\n`))
  } else {
    console.error('')
  }

  if (cmd) {
    console.error(simple(cmd))
    if (cmd.usage.full) console.error(cmd.usage.full)
    else console.error('')
    process.exit(err ? 1 : 0)
  }

  console.error(`Usage: ${chalk.bold(`hyp`)} <command> ${chalk.gray(`[opts...]`)}

${chalk.bold(`General Commands:`)}

  ${simple(commands.host)}

${chalk.bold(`Hyperdrive Commands:`)}

  ${simple(commands.driveCreate)}

  ${simple(commands.driveLs)}
  ${simple(commands.driveMkdir)}
  ${simple(commands.driveRmdir)}

  ${simple(commands.driveCat)}
  ${simple(commands.drivePut)}
  ${simple(commands.driveRm)}

  ${simple(commands.driveDiff)}
  ${simple(commands.driveCopy)}

  ${simple(commands.driveHttp)}

${chalk.bold(`Hyperbee Commands:`)}

  ${simple(commands.beeCreate)}

  ${simple(commands.beeLs)}
  ${simple(commands.beeGet)}
  ${simple(commands.beePut)}
  ${simple(commands.beeDel)}

  ${chalk.green(`Learn more at https://github.com/hypecore-protocol/cli`)}
`)
  process.exit(err ? 1 : 0)
}

function simple (cmd) {
  return `${chalk.bold(`hyp ${cmd.name}`)} ${cmd.usage.simple ? `${cmd.usage.simple} -` : `-`} ${cmd.description}`
}
