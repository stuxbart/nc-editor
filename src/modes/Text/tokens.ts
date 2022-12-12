import { HighlighterSchema } from '../../highlighter';
import { TokenType } from '../../tokenizer/token';

export const TextTokens: TokenType = {
	WORD: 0,
	WHITE_SPACE: 1,
};

export const TextHighlighterSchema: HighlighterSchema = {
	[TextTokens.WORD]: 'nc-format__word',
	[TextTokens.WHITE_SPACE]: 'nc-format__space',
};
