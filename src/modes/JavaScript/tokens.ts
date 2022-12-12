import { HighlighterSchema } from '../../highlighter';
import { TokenType } from '../../tokenizer/token';

export const JSTokens: TokenType = {
	BOOLEAN: 0,
	OPERATOR: 1,
	ARROW: 2,
	COMMENT: 3,
	COMMA: 4,
	DOT: 5,
	COLON: 6,
	SEMICOLON: 7,
	IDENTIFIER: 8,

	OPEN_BRACE: 9,
	CLOSE_BRACE: 10,
	OPEN_BRACKET: 11,
	CLOSE_BRACKET: 12,
	OPEN_SQUARE_BRACKET: 13,
	CLOSE_SQUARE_BRACKET: 14,

	NUMBER: 15,
	STRING_LITERAL: 16,
	UNKNOWN: 17,
	KEYWORD: 18,
	TYPE: 19,
	DEC_KEYWORD: 20,
	WHITE_SPACE: 21,
};

export const JSHighlighterSchema: HighlighterSchema = {
	[JSTokens.BOOLEAN]: 'nc-format__word',
	[JSTokens.OPERATOR]: 'nc-format__operator',
	[JSTokens.ARROW]: 'nc-format__arrow',
	[JSTokens.COMMENT]: 'nc-format__comment',
	[JSTokens.COMMA]: 'nc-format__comma',
	[JSTokens.DOT]: 'nc-format__dot',
	[JSTokens.COLON]: 'nc-format__colon',
	[JSTokens.SEMICOLON]: 'nc-format__semicolon',
	[JSTokens.IDENTIFIER]: 'nc-format__word',

	[JSTokens.OPEN_BRACE]: 'nc-format__brace',
	[JSTokens.CLOSE_BRACE]: 'nc-format__brace',
	[JSTokens.OPEN_BRACKET]: 'nc-format__bracket',
	[JSTokens.CLOSE_BRACKET]: 'nc-format__bracket',
	[JSTokens.OPEN_SQUARE_BRACKET]: 'nc-format__bracket',
	[JSTokens.CLOSE_SQUARE_BRACKET]: 'nc-format__bracket',

	[JSTokens.NUMBER]: 'nc-format__number',
	[JSTokens.STRING_LITERAL]: 'nc-format__string',
	[JSTokens.UNKNOWN]: 'nc-format__unknown',
	[JSTokens.KEYWORD]: 'nc-format__keyword',
	[JSTokens.TYPE]: 'nc-format__type',
	[JSTokens.DEC_KEYWORD]: 'nc-format__declaration',
	[JSTokens.WHITE_SPACE]: 'nc-format__space',
};
