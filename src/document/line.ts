import { Token } from '../tokenizer';

export default class Line {
	public rawText: string = '';
	public tokens: Token[] = [];
	public lineBreaks: number[] = [];

	constructor(rawText: string, tokens: Token[], lineBreaks: number[]) {
		this.rawText = rawText;
		this.tokens = tokens;
		this.lineBreaks = lineBreaks;
	}
}
