import { HighlighterSchema } from '../../highlighter';
import { TokenType } from '../../tokenizer/token';

export const LaTeXTokens: TokenType = {
	COMMENT: 0,
	COMMA: 1,
	COMMAND: 2,

	OPEN_BRACE: 3,
	CLOSE_BRACE: 4,
	OPEN_BRACKET: 5,
	CLOSE_BRACKET: 6,
	OPEN_SQUARE_BRACKET: 7,
	CLOSE_SQUARE_BRACKET: 8,

	WORD: 9,
	UNKNOWN: 10,
	WHITE_SPACE: 11,
	EQUATION: 12,
};

export const LaTeXHighlighterSchema: HighlighterSchema = {
	[LaTeXTokens.COMMENT]: 'nc-format__comment',
	[LaTeXTokens.COMMA]: 'nc-format__comma',
	[LaTeXTokens.COMMAND]: 'nc-format__keyword',

	[LaTeXTokens.OPEN_BRACE]: 'nc-format__bracket',
	[LaTeXTokens.CLOSE_BRACE]: 'nc-format__bracket',
	[LaTeXTokens.OPEN_BRACKET]: 'nc-format__bracket',
	[LaTeXTokens.CLOSE_BRACKET]: 'nc-format__bracket',
	[LaTeXTokens.OPEN_SQUARE_BRACKET]: 'nc-format__bracket',
	[LaTeXTokens.CLOSE_SQUARE_BRACKET]: 'nc-format__bracket',

	[LaTeXTokens.UNKNOWN]: 'nc-format__unknown',
	[LaTeXTokens.WORD]: 'nc-format__word',
	[LaTeXTokens.WHITE_SPACE]: 'nc-format__whitespace',
	[LaTeXTokens.EQUATION]: 'nc-format__string',
};
