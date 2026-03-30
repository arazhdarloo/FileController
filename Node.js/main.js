const readline = require('readline')
const fs = require('fs')
const path = require('path')

console.clear()

const intro = `
------------------- list of commands -------------------
1 - path => {
  set => structure: './test' || 'C:\\Users\\Alireza\\Desktop\\Projects'
}
2 - files => {
  get-all => write files on './log/filesList-log.json'
  set-pattern => {
    enter the structure. eg: '12-movie.mp4'
    enter split symbol. eg: ' - || , || _ '  
  }
}

enter 'help' to show this message again
enter 'exit' to finish the program
--------------------------------------------------------
`

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

let currentPath = ""
let start = true
let splitStructure = {
  index: null,
  symbol: null
}

const commandManagement = async (command) => {
  try {
    if (command == "path") {
      const pathInput = await ask("path - enter your command : ")
      if (pathInput == "set") {
        const setInput = await ask("enter path : ")
        if (checkFolder(setInput)) {
          if (currentPath !== "") {
            const confirm = await ask(`you already added ${currentPath}. do you wanna clear that? (y,n)`)
            if (confirm == "y") {
              currentPath = ''
              currentPath = setInput
              console.log(`the ${currentPath} added`)
            }
          } else {
            currentPath = setInput
            console.log(`the ${currentPath} added`)
          }
        } else {
          console.log('its a wrong path')
        }
      }
    } else if (command == 'files') {
      if (currentPath !== '') {
        const filesInput = await ask("files - enter your command : ")
        if (filesInput == 'get-all') {
          const logDir = path.join(__dirname, 'log');
          if (!checkFolder(logDir)) {
            await fs.promises.mkdir('log')
            console.log("log folder created")
          }

          const files = JSON.stringify(fs.readdirSync(path.join(__dirname, currentPath)), null, 2)
          fs.writeFileSync(path.join(logDir, 'filesList-log.json'), files, 'utf-8')
          console.log('saved to log/filesList-log.json')
        }else if(filesInput == 'set-pattern'){
          const structure = await ask('files - enter the structure : ')
          const symbol = await ask('files - enter the symbol : ')

          const result = structure.split(symbol)
          result.forEach((element, index) => {
            console.log(`${index} : ${element}`)
          })
          const index = await ask("enter the currect index for sorting : ")
          console.log(result[Number(index)])
          const confirm = await ask("is that true? (y,n)")
          if(confirm == "y"){
            splitStructure.index = index
            splitStructure.symbol = symbol
            console.log(`${JSON.stringify(splitStructure, null, 2)} added.`)
          }
        }
      } else {
        console.log("please enter a path")
      }
    } else {
      console.log('unknom command!')
    }
  } catch (err) {
    console.log(`it has an error to process command - ${err}`)
  }
}

const checkFolder = (path) => {
  try {
    if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
      return true
    } else {
      return false
    }
  } catch (err) {
    console.log(`it has an error for checking path - ${err}`)
    return false
  }
}

(async () => {
  while (true) {
    if (start) {
      console.log(intro)
      start = false
    }

    const command = await ask("enter your command : ")
    if (command == "help") console.log(intro)
    else if (command == 'exit') break
    else await commandManagement(command)
  }

  rl.close()
})()