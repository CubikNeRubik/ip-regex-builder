import babel from 'rollup-plugin-babel';
import {uglify} from 'rollup-plugin-uglify';

export default {
    input: 'src/ip.js',
    output: {
        name: "ip-regex",
        file: 'min/ip.min.js',
        format: 'umd'
    },
    plugins: [
        babel(),
        uglify()
    ]
};