const globby = require('globby')
const fs = require('fs')

async function checkFilesForFontAwesomeIcon() {
  const files = await globby(['**/*.ts', '**/*.tsx'])
  let found = false

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8')
    const regex =
      /import\s*\{\s*(.*?)\s*\}\s*from\s*['"]@fortawesome\/free-solid-svg-icons['"]/g
    let match

    while ((match = regex.exec(content)) !== null) {
      const [, icons] = match
      const individualIcons = icons.split(',').map((icon) => icon.trim())
      if (!individualIcons.some((icon) => icon.includes('/'))) {
        console.error(
          `Found occurrence of { faIcon } from '@fortawesome/free-solid-svg-icons' in ${file}`
        )
        found = true
      }
    }
  })

  if (found) {
    process.exit(1)
  }
}

checkFilesForFontAwesomeIcon()
