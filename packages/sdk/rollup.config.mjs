import jsn from '@rollup/plugin-json'
import tsc from '@rollup/plugin-typescript'
import fs from 'fs'
import del from 'rollup-plugin-delete'
import dts from 'rollup-plugin-dts'

/**
 * # getPkgJson
 * Get's the package.json file and returns it parsed.
 * @returns {Object} package.json
 */
const getPkgJson = () =>
  JSON.parse(fs.readFileSync(`packages/sdk/package.json`, 'utf-8'))

/**
 * # rollupTypes
 * Rolls up the types of a package into a single file
 * @returns {import('rollup'.RollupOptions)}
 */
const rollupTypes = () => {
  return {
    input: `packages/sdk/dist/sdk/src/index.d.ts`,
    output: {
      file: `packages/sdk/dist/index.d.ts`,
      format: 'es',
      sourcemap: false,
    },
    treeshake: true,
    plugins: [
      dts(),
      del({
        targets: `packages/sdk/dist/**/*/`,
        hook: 'buildEnd',
        runOnce: false,
      }),
    ],
  }
}

/**
 * # rollupPackage
 * Rolls up a package
 * @returns {import('rollup'.RollupOptions)}
 */
const rollupPackage = () => {
  /**
   * @type {import('rollup'.RollupOptions)}
   */
  const options = {
    input: `packages/sdk/src/index.ts`,
    external: Object.keys(getPkgJson().peerDependencies || {}),
    cache: false,
    treeshake: true,
    output: [
      {
        file: `packages/sdk/dist/index.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `packages/sdk/dist/index.module.js`,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      jsn(),
      tsc({
        sourceMap: true,
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: `packages/sdk/dist/`,
      }),
    ],
  }
  return options
}

export default [rollupPackage(), rollupTypes()]
