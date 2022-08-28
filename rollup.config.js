import typescript from 'rollup-plugin-typescript2'
import cleaner from 'rollup-plugin-cleaner'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import pkg from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false,
    },
  ],
  plugins: [
    cleaner({
      targets: ['./dist/'],
    }),
    commonjs(),
    resolve(),
    typescript(),
  ],
  external: ['@storyblok/js', 'file-system-cache', 'url-join'],
}
