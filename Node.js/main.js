const readline = require('readline')
const fs = require('fs')
const path = require('path')
const { url } = require('inspector')
const scraper = require('./gitScraper')

console.clear()

const intro = `
------------------- list of commands -------------------
1 - path => {
  set => structure: './test' || 'C:\\Users\\Alireza\\Desktop\\Projects'
  get => return the saved path
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
  enter the file type. **IF YOU WANT TO ADD TWO OR MORE TYPES, YOU CAN SPLIT THEM WITH '-'**
  enter range. eg : '20-65'
}
4 - scrap => {
  enter URL  
}

enter 'help' to show this message again
enter 'break' to close section
enter 'exit' to finish the program
--------------------------------------------------------
`

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

let currectPath = ""
let fileType = ""
let start = true
let moveState = false
let splitStructure = {
  index: null,
  symbol: null
}

const pathController = async (pathInput) => {
  try {
    if (pathInput.includes("set")) {
      const setInput = await ask("path - enter path : ")
      if (checkFolder(setInput)) {
        if (currectPath !== "") {
          const confirm = await ask(`path - you already added ${currectPath}. do you wanna clear that? (Y,n) `)
          if (confirm.toLowerCase() == "y" || confirm == "") {
            currectPath = ''
            currectPath = setInput
            console.log(`path - the ${currectPath} added`)
          }
        } else {
          currectPath = setInput
          console.log(`path - the ${currectPath} added`)
        }
      }
    } else if (pathInput.includes("get")) {
      if (currectPath !== '') {
        console.log(`path - your path is '${currectPath}'`)
      } else {
        console.log('path - please enter a path.')
      }
    } else {
      console.log('path - its a wrong command')
    }
  } catch (err) {
    console.log(`it has an error to process path - ${err}`)
  }
}

const filesController = async (filesInput) => {
  try {
    if (filesInput.includes('get-all')) {
      const logDir = path.join('log')
      if (!checkFolder(logDir)) {
        await fs.promises.mkdir('log')
        console.log("files - log folder created")
      }

      const files = JSON.stringify(fs.readdirSync(path.join(currectPath)), null, 2)
      fs.writeFileSync(path.join(logDir, 'filesList-log.json'), files, 'utf-8')
      console.log('files - saved to log/filesList-log.json')
      const showFiles = await ask("do you wanna show that on terminal? (Y,n) ")
      if (showFiles.toLowerCase() == 'y' || showFiles == '')
        console.log(files)
    } else if (filesInput.includes('set-pattern')) {
      const structure = await ask('files - enter the structure : ')
      const symbol = await ask('files - enter the symbol : ')

      const result = structure.split(symbol)
      result.forEach((element, index) => {
        console.log(`${index} : ${element}`)
      })
      const index = await ask("files - enter the currect index for sorting : ")
      console.log(result[Number(index)])
      const confirm = await ask("files - is that true? (Y,n) ")
      if (confirm.toLowerCase() == "y" || confirm == "") {
        splitStructure.index = index
        splitStructure.symbol = symbol
        console.log(`files - ${JSON.stringify(splitStructure, null, 2)} added.`)
      }
    } else {
      console.log('files - its a wrong command')
    }
  } catch (err) {
    console.log(`it has an error to process files - ${err}`)
  }
}

const splitController = async (data = {}, skip = 0) => {
  try {
    let folderName
    if (data.title) {
      folderName = `${data.index} - ${data.title}`
    } else {
      folderName = await ask("split - enter folder name : ")
    }
    const splitPath = path.join(currectPath, folderName)
    const folderFiles = fs.readdirSync(currectPath)
    const currectFile = []
    if (folderName === "break") return 0
    if (!checkFolder(splitPath)) {
      await fs.promises.mkdir(splitPath)
      console.log(`split - '${folderName}' created!`)
    } else {
      console.log("split - this folder already exist.")
    }
    if (fileType === "") {
      fileType = await ask("split - enter the file type (without dot) : ")
    }
    const types = fileType.split('-')
    folderFiles.forEach(element => {
      const splitedElement = element.split('.')
      const type = splitedElement[splitedElement.length - 1]
      if (types.indexOf(type) !== -1) {
        currectFile.push(element)
      }
    })
    console.log(currectFile)

    const getNumber = (name) => {
      const result = name.split(splitStructure.symbol)
      return result[splitStructure.index]
    }

    const moveFile = async (fileName, dest) => {
      try {
        const filePath = path.join(currectPath, fileName)
        const destPath = path.join(currectPath, dest, fileName)
        await fs.promises.copyFile(filePath, destPath)
        console.log(`split - ${fileName} moved`)
        await fs.promises.unlink(filePath)
        console.log(`split - ${fileName} deleted!`)
      } catch (err) {
        console.log(`split - can't delete ${fileName} - ${err}`)
      }
    }

    let rangeInput
    if (data.numbers) {
      const numbers = data.numbers
      rangeInput = `${numbers[0]}-${numbers[numbers.length - 1]}`
    } else {
      rangeInput = await ask("split - enter the range : ")
    }
    const range = rangeInput.split('-')
    const moveFiles = []
    console.log(range)
    currectFile.forEach(element => {
      if (Number(range[0]) <= Number(getNumber(element)) && Number(getNumber(element) <= range[1])) {
        moveFiles.push(element)
      }
    })

    console.log(moveFiles)
    if (!moveState) {
      const confirm = await ask("split - do you wanna move files? (Y,n) ")

      if (confirm.toLowerCase() == "--y") {
        moveState = true
        for (const element of moveFiles) {
          await moveFile(element, folderName)
        }
      } else if (confirm.toLowerCase() == "y" || confirm == "") {
        for (const element of moveFiles) {
          await moveFile(element, folderName)
        }
      }
    } else {
      for (const element of moveFiles) {
        await moveFile(element, folderName)
      }
    }

  } catch (err) {
    console.log(`split - it has an error to process split - ${err}`)
  }
}

const scrapController = async () => {
  const URL = await ask('scrap - enter URL : ')

  if (URL === "break") return 0

  const data = await scraper(URL)
  const skip = await ask("scrap - do you want skip some subjects? (Y, n) ")
  let skipNumber = 0
  if (skip.toLowerCase() == 'y' || skip == '') {
    skipNumber = await ask("scrap - enter your last number : ")
  }
  if (data.length > 0) {
    for (const element of data) {
      if (Number(element.index) >= Number(skipNumber)) {
        console.log(element)
        await splitController(element)
      }
    }
  }
}

const commandManagement = async (command) => {
  try {
    if (command == "path") {
      while (true) {
        const pathInput = await ask("path - enter your command : ")
        if (pathInput == 'break') break
        await pathController(pathInput)
      }
    } else if (command == 'files') {
      if (currectPath !== '') {
        while (true) {
          const filesInput = await ask("files - enter your command : ")
          if (filesInput == 'break') break
          await filesController(filesInput)
        }
      } else {
        console.log("please enter a path")
      }
    } else if (command == 'split') {
      if (currectPath !== "" && splitStructure.index && splitStructure.symbol) {
        while (true) {
          if ((await splitController()) === 0) break
        }
      } else {
        console.log("enter path and setup structure.")
      }
    } else if (command == 'scrap') {
      if (currectPath !== "" && splitStructure.index && splitStructure.symbol) {
        while (true) {
          if ((await scrapController()) === 0) break
        }
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