import fs from 'node:fs'
import openapiTS from 'openapi-typescript'

const generateTypes = async () => {
  const options = {
    formatter: (schemaObject, metadata) => {
      const alternatives = schemaObject['x-alternatives']
      if (alternatives && alternatives[0] && alternatives[0].items) {
        const types = alternatives
          .map((alternative) => {
            if (alternative.type === 'array' && alternative.items) {
              if (alternative.items.enum) {
                return `(${alternative.items.enum
                  .map((enumItem) => `"${enumItem}"`)
                  .join(' | ')})[]`
              }
              return `${alternative.items.type}[]`
            }
            return alternative.type
          })
          .join(' | ')
        console.log('Generated alternative types for:', schemaObject.name)
        console.log('Output:', types)
        return types
      }
    },
  }
  const output = await openapiTS(
    'https://api.reservoir.tools/swagger.json',
    options
  )

  console.log('Types Generated')

  fs.writeFileSync('./src/types/api.ts', output)
}

generateTypes()
