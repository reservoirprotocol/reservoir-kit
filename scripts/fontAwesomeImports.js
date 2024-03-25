const globby = require('globby')
const fs = require('fs')

async function checkFilesForFontAwesomeIcon() {
  const files = await globby(['packages/ui/src/**/*.ts', 'packages/ui/src/**/*.tsx'])

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8')
  const regex = new RegExp('@fortawesome/free-solid-svg-icons/')
    content.split('\n').forEach((line) => {
      if (!regex.test(line) && line.includes('@fortawesome/free-solid-svg-icons')) {
        console.log(line)
        console.error(
          `Found occurrence of { faIcon } from '@fortawesome/free-solid-svg-icons' in ${file}`
        )
        process.exit(1)
      }
    })

  })
}


checkFilesForFontAwesomeIcon()
