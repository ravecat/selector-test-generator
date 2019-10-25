import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: './src/index.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
    terser(),
  ],
  external: ['fs', 'events', 'child_process', 'util', 'path'],
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
};
