import jsn from '@rollup/plugin-json'
import tsc from '@rollup/plugin-typescript'
import fs from 'fs'
import del from 'rollup-plugin-delete'
import dts from 'rollup-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer'

/**
 * # getPkgJson
 * Get's the package.json file and returns it parsed.
 * @param {String} pkg - Package to return the pkg.json for
 * @returns {Object} package.json
 */
const getPkgJson = (pkg) =>
  JSON.parse(fs.readFileSync(`packages/${pkg}/package.json`, 'utf-8'))

/**
 * # rollupTypes
 * Rolls up the types of a package into a single file
 * @param {String} pkg - Types to rollup
 * @returns {import('rollup'.RollupOptions)}
 */
const rollupTypes = (pkg) => {
  return {
    input: `packages/${pkg}/dist/${pkg}/src/index.d.ts`,
    output: {
      file: `packages/${pkg}/dist/index.d.ts`,
      format: 'es',
    },
    sourcemap: false,
    plugins: [
      dts(),
      del({
        targets: `packages/${pkg}/dist/**/*/`,
        hook: 'buildEnd',
        runOnce: true,
      }),
    ],
  }
}

/**
 * # rollupPackage
 * Rolls up a package
 * @param {String} pkg - Package to rollup
 * @returns {import('rollup'.RollupOptions)}
 */
const rollupPackage = (pkg) => {
  /**
   * @type {import('rollup'.RollupOptions)}
   */
  const options = {
    input: `packages/${pkg}/src/index.ts`,
    external: Object.keys(getPkgJson(pkg).peerDependencies || {}),
    sourcemap: true,
    cache: false,
    treeshake: true,
    output: [
      {
        file: `packages/${pkg}/dist/index.js`,
        format: 'cjs',
      },
      {
        file: `packages/${pkg}/dist/index.module.js`,
        format: 'esm',
      },
    ],
    plugins: [
      jsn(),
      tsc({
        sourceMap: false,
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: `packages/${pkg}/dist/`,
      }),
      visualizer(),
    ],
  }
  return options
}

export default [
  rollupPackage('sdk'),
  rollupTypes('sdk'),
  rollupPackage('ui'),
  rollupTypes('ui'),
]
