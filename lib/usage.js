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

  ${simple(commands.info)}
  ${simple(commands.seed)}
  ${simple(commands.unseed)}
  ${simple(commands.create)}

  ${simple(commands.beam)}

${chalk.bold(`Hyperdrive Commands:`)}

  ${simple(commands.driveLs)}
  ${simple(commands.driveMkdir)}
  ${simple(commands.driveRmdir)}

  ${simple(commands.driveCat)}
  ${simple(commands.drivePut)}
  ${simple(commands.driveRm)}

  ${simple(commands.driveDiff)}
  ${simple(commands.driveSync)}

  ${simple(commands.driveHttp)}

${chalk.bold(`Hyperbee Commands:`)}

  ${simple(commands.beeLs)}
  ${simple(commands.beeGet)}
  ${simple(commands.beePut)}
  ${simple(commands.beeDel)}

${chalk.bold(`Daemon Commands:`)}

  ${simple(commands.daemonStatus)}
  ${simple(commands.daemonStart)}
  ${simple(commands.daemonStop)}

${chalk.bold(`Aliases:`)}

  ${chalk.bold('hyp sync')} -> hyp drive sync
  ${chalk.bold('hyp diff')} -> hyp drive diff
  ${chalk.bold('hyp ls')} -> hyp drive ls
  ${chalk.bold('hyp cat')} -> hyp drive cat
  ${chalk.bold('hyp put')} -> hyp drive put

  ${chalk.green(`Learn more at https://github.com/hypercore-protocol/cli`)}
`)
  process.exit(err ? 1 : 0)
}

function simple (cmd) {
  return `${chalk.bold(`hyp ${cmd.name}`)} ${cmd.usage.simple ? `${cmd.usage.simple} -` : `-`} ${cmd.description}`
}
