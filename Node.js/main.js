const readline = require('readline')
const fs = require('fs')

console.clear()

const intro = `
------------------- list of commands -------------------
1 - set-path => structure: './test' || 'C:\\Users\\Alireza\\Desktop\\Projects'

enter 'exit' to finish the program
--------------------------------------------------------
`

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const ask = (query) => new Promise((resolve) => rl.question(query, resolve));

let currentPath = ""

const commandManagement = async (command) => {
  try {
    if (command == "set-path") {
      const pathInput = await ask("enter path : ")
      if (checkFolder(pathInput)) {
        if (currentPath !== "") {
          const confirm = await ask(`you already added ${currentPath}. do you wanna clear that? (y,n)`)
          if (confirm == "y") {
            currentPath = ''
            currentPath = pathInput
            console.log(`the ${currentPath} added`)
            await ask("press enter to return...")
          } else {
            await ask("press enter to return...")
          }
        } else {
          currentPath = pathInput
          console.log(`the ${currentPath} added`)
          await ask("press enter to return...")
        }
      } else {
        console.log('its a wrong path')
        await ask("press enter to return...")
      }
    } else {
      console.log('unknom command!')
      await ask("press enter to return...")
    }
  } catch (err) {
    console.log(`it has an error to process command - ${err}`)
    await ask("press enter to return...")
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
    console.log(intro)

    const command = await ask("enter your command : ")

    if (command == 'exit') break

    await commandManagement(command)
  }

  rl.close()
})()