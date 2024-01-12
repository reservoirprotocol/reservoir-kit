import fs from 'node:fs'
import openapiTS from 'openapi-typescript'
import axios from 'axios'

const generateTypes = async () => {
  // Fetch the OpenAPI schema
  const response = await axios('https://api.reservoir.tools/swagger.json')
  const openapiSchema = JSON.parse(response.data)

  // Extract routes
  const routes = Object.keys(openapiSchema.paths).filter(
    (path) => !path.includes('admin')
  )

  // Save routes as a runtime export
  fs.writeFileSync(
    './src/routes/index.ts',
    `export const routes = ${JSON.stringify(routes, null, 2)};`
  )

  const options = {
    formatter: (schemaObject, metadata) => {
      if (
        schemaObject['x-type'] === 'object' &&
        schemaObject.name &&
        schemaObject.type
      ) {
        const typeName = `\`${schemaObject.name}[\${string}]\` | \`${schemaObject.name}[\${string}]\`[]`
        console.log('Generated custom type for:', schemaObject.name)
        console.log('Output:', typeName)
        return typeName
      }

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
