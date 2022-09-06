import typescript from 'rollup-plugin-typescript2'
import cleaner from 'rollup-plugin-cleaner'

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      dir: 'dist/esm',
      format: 'esm',
      exports: 'named',
      sourcemap: true,
    },
  ],
  plugins: [
    cleaner({
      targets: ['dist'],
    }),
    typescript({
      tsconfigOverride: {
        exclude: ['/**/*.test.ts'],
      },
    }),
  ],
  external: ['file-system-cache', 'storyblok-js-client', 'url-join', 'react'],
}
