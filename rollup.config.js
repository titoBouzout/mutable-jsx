import babel from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'

const plugins = [
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
					replacement: '../../../src/core',
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
]

export default [
	{
		input: 'src/index.ts',
		output: [
			{
				format: 'cjs',
				file: 'lib/index.js',
			},
			{
				format: 'es',
				file: 'dist/index.js',
			},
		],
		external: ['mobx'],
		plugins,
	},
]
