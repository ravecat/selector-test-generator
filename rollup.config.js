import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: './src/index.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    uglify(),
  ],
  external: ['commander'],
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
};
