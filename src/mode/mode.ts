import { HighlighterSchema } from '../highlighter';
import { Tokenizer } from '../tokenizer/tokenizer';

export default class Mode {
	private _tokenizer: Tokenizer;
	private _highlighterSchema: HighlighterSchema;

	constructor(tokenizer: Tokenizer, highlighterSchema: HighlighterSchema) {
		this._tokenizer = tokenizer;
		this._highlighterSchema = highlighterSchema;
	}

	public get schema(): HighlighterSchema {
		return this._highlighterSchema;
	}

	public get tokenizer(): Tokenizer {
		return this._tokenizer;
	}
}
