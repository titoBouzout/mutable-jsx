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
		plugins: [
			[
				'babel-plugin-jsx-dom-expressions',
				{
					moduleName: 'mutable-jsx',
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
]

export default [
	{
		input: 'index.js',
		output: [
			{
				format: 'cjs',
				file: 'dist/index.js',
			},
		],
		plugins,
	},
]
