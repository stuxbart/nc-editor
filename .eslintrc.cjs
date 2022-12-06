module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/strict',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'prettier'],
	root: true,
	parserOptions: {
		tsconfigRootDir: '.',
		project: ['./tsconfig.json'],
	},
	rules: {
		semi: ['error', 'always'],
		'@typescript-eslint/explicit-function-return-type': 'warn',
		'@typescript-eslint/explicit-member-accessibility': 'warn',
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'memberLike',
				modifiers: ['private'],
				format: ['camelCase'],
				leadingUnderscore: 'require',
			},
			{
				selector: 'variable',
				types: ['boolean'],
				format: ['PascalCase'],
				prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
			},
		],
	},
};
