import babel from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { spawn } from 'child_process'

function test() {
	let testFile = 'test/index.test.node.js'
	let subprocess = {}
	return {
		buildStart(options) {
			this.addWatchFile(testFile)
		},
		async buildEnd(e) {
			if (subprocess.kill) {
				subprocess.kill()
			}

			subprocess = spawn('node', [testFile], {
				stdio: 'inherit',
			})
		},
	}
}

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				format: 'es',
				file: 'dist/index.js',
			},
		],
		plugins: [
			nodeResolve({
				extensions: ['.js', '.ts'],
			}),
			babel({
				extensions: ['.js', '.ts'],
				babelHelpers: 'bundled',
				presets: ['@babel/preset-typescript'],
				plugins: [
					[
						'babel-plugin-transform-rename-import',
						{
							original: 'rxcore',
							replacement: '../../../src/dom-expressions/index',
						},
					],
				],
			}),
			replace({
				values: {
					'process.env.NODE_ENV': JSON.stringify('production'),
					__buildDate__: () => Date.now(),
					__buildVersion: 1,
				},
				preventAssignment: false,
			}),
		],
	},
	// html test
	{
		input: 'test/index.html.js',
		output: [
			{
				format: 'cjs',
				file: 'test/dist/index.js',
			},
		],
		plugins: [
			nodeResolve({
				extensions: ['.js', '.ts'],
			}),
			babel({
				extensions: ['.js', '.ts'],
				babelHelpers: 'bundled',
				plugins: [
					[
						'babel-plugin-jsx-dom-expressions',
						{
							moduleName: '../dist/index.js',
						},
					],
				],
			}),
			replace({
				values: {
					'process.env.NODE_ENV': JSON.stringify('production'),
					'__DEV__': false,
					__buildDate__: () => Date.now(),
					__buildVersion: 1,
				},
				preventAssignment: false,
			}),
			test(),
		],
	},
]
