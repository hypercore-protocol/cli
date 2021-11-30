import chalk from 'chalk'

const FULL_USAGE = ` The alias command allows you to create aliases for the long urls...` //I will think of something


export default {
  name: 'alias',
  description: 'Create an alias for the urls',
  usage: {
    simple: '[alias] [full_url]',
    full: FULL_USAGE
  },
  command: async function (args) { 
     let url = args[1]
     let alias = args[0]
     if (!url || !alias){
        console.error(chalk.bold("Correct usage: ")+"hyp alias [alias] [full_url]")
     }


    process.once('SIGINT', () => {
      
    })

  }
}
