import chalk from 'chalk'

export default function usage (err) {
  if (err) { 
    console.log(chalk.red(`${err}\n`))
  } else {
    console.log('')
  }
  console.log(`Usage: ${chalk.bold(`hk`)} <command> ${chalk.gray(`[opts...]`)}

${chalk.bold(`Commands:`)}

  ${chalk.bold(`ls`)} {url} - List the entries of the given hyper URL.
  ${chalk.bold(`cat`)} {url} - Output the content of the given hyper URL.
  
  ${chalk.bold(`diff`)} {path_or_url} {path_or_url} - Diff two locations against each other.
  ${chalk.bold(`mirror`)} {path_or_url} {path_or_url} ${chalk.gray(`[-w|--watch]`)} - Rewrite the right location to mirror the left location.

  ${chalk.bold(`static`)} {url} ${chalk.gray(`[-p|--port {port}]`)} - Host a hyperdrive as a static site.
  ${chalk.bold(`gui`)} {url} ${chalk.gray(`[-p|--port {port}]`)} - Explore a hyperdrive in an explorer GUI.

  ${chalk.green(`Learn more at https://github.com/hypecore-protocol/hyperkit`)}
`)
  process.exit(err ? 1 : 0)
}