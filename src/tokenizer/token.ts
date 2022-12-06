export interface Token {
	type: TokenType;
	startIndex: number;
}

export enum TokenType {
	BOOLEAN,
	OPERATOR = 'nc-format__operator',
	ARROW = 'nc-format__arrow',
	COMMENT = 'nc-format__comment',
	COMMA = 'nc-format__comma',
	DOT = 'nc-format__dot',
	COLON = 'nc-format__colon',
	SEMICOLON = 'nc-format__semicolon',
	IDENTIFIER = 'nc-format__word',

	OPEN_BRACE = 'nc-format__brace',
	CLOSE_BRACE = 'nc-format__brace',
	OPEN_BRACKET = 'nc-format__bracket',
	CLOSE_BRACKET = 'nc-format__bracket',
	OPEN_SQUARE_BRACKET = 'nc-format__bracket',
	CLOSE_SQUARE_BRACKET = 'nc-format__bracket',

	NUMBER = 'nc-format__number',
	STRING_LITERAL = 'nc-format__string',
	UNKNOWN = 'nc-format__unknown',
	KEYWORD = 'nc-format__keyword',
	TYPE = 'nc-format__type',
	DEC_KEYWORD = 'nc-format__declaration',
	WHITE_SPACE = 'nc-format__space',
}
