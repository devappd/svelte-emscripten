import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import { string } from 'rollup-plugin-string';
import pkg from './package.json';

const name = pkg.name
	.replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
	.replace(/^\w/, m => m.toUpperCase())
	.replace(/-\w/g, m => m[1].toUpperCase());

export default {
	input: 'src/index.js',
	output: [
		{ file: pkg.module, 'format': 'es' },
		{ file: pkg.main, 'format': 'umd', name }
	],
	plugins: [
		svelte(),
		// Stringify worker scripts
		string({
			include: [
				'src/emscripten-component-base/worker/*.preamble.js',
				'src/emscripten-component-base/worker/*.postamble.js'
			]
		}),
		resolve()
	]
};
