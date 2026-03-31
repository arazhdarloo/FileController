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
    enter split symbol. eg: ' - ' || ' , ' || ' _ '  
  }
}
3 - split => {
  enter folder name.
  enter range. eg : '20-65'
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

let currectPath = ""
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
          if (currectPath !== "") {
            const confirm = await ask(`you already added ${currectPath}. do you wanna clear that? (y,n)`)
            if (confirm == "y") {
              currectPath = ''
              currectPath = setInput
              console.log(`the ${currectPath} added`)
            }
          } else {
            currectPath = setInput
            console.log(`the ${currectPath} added`)
          }
        } else {
          console.log('its a wrong path')
        }
      }
    } else if (command == 'files') {
      if (currectPath !== '') {
        const filesInput = await ask("files - enter your command : ")
        if (filesInput == 'get-all') {
          const logDir = path.join(currectPath, 'log');
          if (!checkFolder(logDir)) {
            await fs.promises.mkdir('log')
            console.log("log folder created")
          }

          const files = JSON.stringify(fs.readdirSync(path.join(currectPath)), null, 2)
          fs.writeFileSync(path.join(logDir, 'filesList-log.json'), files, 'utf-8')
          console.log('saved to log/filesList-log.json')
        } else if (filesInput == 'set-pattern') {
          const structure = await ask('files - enter the structure : ')
          const symbol = await ask('files - enter the symbol : ')

          const result = structure.split(symbol)
          result.forEach((element, index) => {
            console.log(`${index} : ${element}`)
          })
          const index = await ask("enter the currect index for sorting : ")
          console.log(result[Number(index)])
          const confirm = await ask("is that true? (y,n)")
          if (confirm == "y") {
            splitStructure.index = index
            splitStructure.symbol = symbol
            console.log(`${JSON.stringify(splitStructure, null, 2)} added.`)
          }
        }
      } else {
        console.log("please enter a path")
      }
    } else if (command == 'split') {
      if (currectPath !== "" && splitStructure.index && splitStructure.symbol) {
        const folderName = await ask("split - enter folder name : ")
        const splitPath = path.join(currectPath, folderName)
        const folderFiles = fs.readdirSync(currectPath)
        const currectFile = []

        if (!checkFolder(splitPath)) {
          await fs.promises.mkdir(splitPath)
          console.log(`'${folderName}' created!`)
        } else {
          console.log("this folder already exist.")
        }
        const fileType = await ask("enter the file type (without dot) : ")

        folderFiles.forEach(element => {
          const splitedElement = element.split('.')
          const type = splitedElement[splitedElement.length - 1]
          if (fileType == type) {
            currectFile.push(element)
          }
        })
        console.log(currectFile)

        const getNumber = (name) => {
          const result = name.split(splitStructure.symbol)
          return result[splitStructure.index]
        }

        const moveFile = (fileName, dest) => {
          const filePath = path.join(currectPath, fileName)
          const destPath = path.join(currectPath, dest, fileName)
          fs.promises.copyFile(filePath, destPath)
            .then(() => {
              console.log(`${fileName} moved`)
              fs.promises.unlink(filePath)
                .then(() => {
                  console.log(`${fileName} deleted!`)
                })
                .catch(err => {
                  console.log(`cant delete ${fileName} - ${err}`)
                })
            })
            .catch(err => {
              console.log(`cant move ${fileName} - ${err}`)
            })
        }

        const rangeInput = await ask("enter the range : ")
        const range = rangeInput.split('-')
        const moveFiles = []
        console.log(range)
        currectFile.forEach(element => {
          if (Number(range[0]) <= Number(getNumber(element)) && Number(getNumber(element) <= range[1])) {
            moveFiles.push(element)
          }
        })

        console.log(moveFiles)
        const confirm = await ask("do you wanna move files? (y,n)")

        if (confirm == 'y') {
          moveFiles.forEach(element => {
            moveFile(element, folderName)
          })
        }

        console.log("finished")

      } else {
        console.log("enter path and setup structure.")
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