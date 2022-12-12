import { TokenType } from '../../tokenizer/token';

export const JSTokens: TokenType = {
	BOOLEAN: 0,
	OPERATOR: 1, // = 'nc-format__operator',
	ARROW: 2, // = 'nc-format__arrow',
	COMMENT: 3, //= 'nc-format__comment',
	COMMA: 4, //= 'nc-format__comma',
	DOT: 5, //= 'nc-format__dot',
	COLON: 6, //= 'nc-format__colon',
	SEMICOLON: 7, // = 'nc-format__semicolon',
	IDENTIFIER: 8, //= 'nc-format__word',

	OPEN_BRACE: 9, //= 'nc-format__brace',
	CLOSE_BRACE: 10, //= 'nc-format__brace',
	OPEN_BRACKET: 11, //= 'nc-format__bracket',
	CLOSE_BRACKET: 12, // = 'nc-format__bracket',
	OPEN_SQUARE_BRACKET: 13, //= 'nc-format__bracket',
	CLOSE_SQUARE_BRACKET: 14, //= 'nc-format__bracket',

	NUMBER: 15, // = 'nc-format__number',
	STRING_LITERAL: 16, //= 'nc-format__string',
	UNKNOWN: 17, // = 'nc-format__unknown',
	KEYWORD: 18, // = 'nc-format__keyword',
	TYPE: 19, //= 'nc-format__type',
	DEC_KEYWORD: 20, //= 'nc-format__declaration',
	WHITE_SPACE: 21, //= 'nc-format__space',
};
