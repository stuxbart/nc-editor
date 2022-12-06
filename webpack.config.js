const path = require('path');

module.exports = {
	entry: './src/index.ts',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: [/node_modules/, /example/],
			},
			{
				test: /\.s[ac]ss$/i,
				use: ['style-loader', 'css-loader', 'sass-loader'],
			},
		],
	},

	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'nc-editor.js',
		path: path.resolve(__dirname, 'dist'),
		library: 'nc',
	},
	mode: 'development',
};
