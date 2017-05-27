import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/index.js',
  dest: 'dist/browser.js',
  format: 'cjs',
  sourceMap: true,
  plugins: [
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
  ],
}
