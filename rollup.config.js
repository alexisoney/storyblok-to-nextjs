import typescript from 'rollup-plugin-typescript2'
import cleaner from 'rollup-plugin-cleaner'
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
    typescript(),
  ],
  external: ['file-system-cache'],
}
