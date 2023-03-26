import chalk from 'chalk'
import os from 'os'
import path from 'path'
import fs from 'fs'
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
        process.exit(0)
     }
     if (!String(url).startsWith("hyper://") || String(url).length != 72 ){
       console.error("Invalid url")
       process.exit(0)
     }
     datadir = path.join(os.homedir(),".hyperdrive")
     if (fs.existsSync(datadir)){

     }else {
       fs.mkdirSync(datadir)
     }
     if (fs.existsSync(path.join(datadir,String(url).replace("hyper://","")))){
       fs.rmSync(path.join(datadir,String(url).replace("hyper://","")))
     }
    fs.writeFileSync(path.join(datadir,String(url).replace("hyper://","")),alias)

    process.once('SIGINT', () => {
      process.exit(0)      
    })

  }
}
