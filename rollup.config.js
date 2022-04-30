// TODO: replace by webpack

import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default {
    input: 'src/index.js',
    output: {
        name: 'ip-regex',
        file: 'min/ip.min.js',
        format: 'umd'
    },
    plugins: [
        babel(),
        uglify()
    ]
};