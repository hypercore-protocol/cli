import chalk from 'chalk'

export default function usage (err) {
  if (err) { 
    console.log(chalk.red(`${err}\n`))
  } else {
    console.log('')
  }
  console.log(`Usage: ${chalk.bold(`hk`)} <command> ${chalk.gray(`[opts...]`)}

${chalk.bold(`Hyperdrive Commands:`)}

  ${chalk.bold(`hk drive ls`)} {url} - List the entries of the given hyperdrive URL.
  ${chalk.bold(`hk drive cat`)} {url} - Output the content of the given hyperdrive URL.
  
  ${chalk.bold(`hk drive diff`)} {path_or_url} {path_or_url} - Diff two locations against each other.
  ${chalk.bold(`hk drive mirror`)} {path_or_url} {path_or_url} ${chalk.gray(`[-w|--watch]`)} - Rewrite the right location to mirror the left location.

  ${chalk.bold(`hk drive http`)} {url} ${chalk.gray(`[-p|--port {port}]`)} - Host a hyperdrive as a static site.

${chalk.bold(`Hyperbee Commands:`)}

  ${chalk.bold(`hk bee ls`)} {url} - List the entries of the given hyperbee URL.
  ${chalk.bold(`hk bee get`)} {url} - Get the value of an entry of the given hyperbee URL.
  ${chalk.bold(`hk bee put`)} {url} {value} - Set the value of an entry of the given hyperbee URL.

  ${chalk.green(`Learn more at https://github.com/hypecore-protocol/hyperkit`)}
`)
  process.exit(err ? 1 : 0)
}