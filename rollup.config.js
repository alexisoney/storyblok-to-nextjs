import typescript from 'rollup-plugin-typescript2'
import cleaner from 'rollup-plugin-cleaner'

export default [
  {
    input: 'src/client/index.ts',
    output: [
      {
        dir: 'dist/client/',
        format: 'esm',
        exports: 'named',
        sourcemap: true,
      },
    ],
    plugins: [
      cleaner({
        targets: ['dist/client'],
      }),
      typescript({
        tsconfigOverride: {
          baseUrl: 'src/client',
          include: ['src/client/**/*'],
          exclude: ['/**/*.test.ts'],
        },
      }),
    ],
    external: ['axios', 'storyblok-js-client'],
  },
  {
    input: 'src/node/index.ts',
    output: [
      {
        dir: 'dist/node',
        format: 'esm',
        exports: 'named',
        sourcemap: true,
      },
    ],
    plugins: [
      cleaner({
        targets: ['dist/node'],
      }),
      typescript({
        tsconfigOverride: {
          baseUrl: 'src/node',
          include: ['src/node/**/*'],
          exclude: ['/**/*.test.ts'],
        },
      }),
    ],
    external: ['axios', 'file-system-cache', 'storyblok-js-client', 'url-join'],
  },
]
