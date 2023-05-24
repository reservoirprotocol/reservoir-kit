import jsn from '@rollup/plugin-json'
import tsc from '@rollup/plugin-typescript'
import fs from 'fs'
import del from 'rollup-plugin-delete'
import dts from 'rollup-plugin-dts'

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
      sourcemap: false,
    },
    treeshake: true,
    plugins: [
      dts(),
      del({
        targets: `packages/${pkg}/dist/**/*/`,
        hook: 'buildEnd',
        runOnce: false,
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
    cache: false,
    treeshake: true,
    output: [
      {
        file: `packages/${pkg}/dist/index.js`,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: `packages/${pkg}/dist/index.module.js`,
        format: 'esm',
        sourcemap: true,
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
    ],
  }
  return options
}

export default [
  rollupPackage('sdk'),
  rollupPackage('ui'),
  ...(process.env.NODE_ENV == 'production'
    ? [rollupTypes('ui'), rollupTypes('sdk')]
    : []),
]
