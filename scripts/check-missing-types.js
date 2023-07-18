const fs = require('fs')

const typeFiles = [
  'packages/ui/dist/index.d.ts',
  'packages/sdk/dist/index.d.ts',
  'packages/ethers-wallet-adapter/dist/index.d.ts',
]

const regex = /var Custom[ ;]?$/m

typeFiles.forEach((file) => {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) throw err
    if (regex.test(data)) {
      throw `Encountered a missing type in ${file}`
    }
  })
})
