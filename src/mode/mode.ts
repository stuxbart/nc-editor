import { HighlighterSchema } from '../highlighter';
import { Tokenizer } from '../tokenizer/tokenizer';

export default class Mode {
	private _tokenizer: Tokenizer;
	private _highlighterSchema: HighlighterSchema;
	private _name: string;

	constructor(tokenizer: Tokenizer, highlighterSchema: HighlighterSchema, name: string) {
		this._tokenizer = tokenizer;
		this._highlighterSchema = highlighterSchema;
		this._name = name;
	}

	public get schema(): HighlighterSchema {
		return this._highlighterSchema;
	}

	public get tokenizer(): Tokenizer {
		return this._tokenizer;
	}

	public get name(): string {
		return this._name;
	}
}
