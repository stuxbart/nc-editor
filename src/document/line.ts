import { Token } from '../tokenizer';

export default class Line {
	public rawText: string = '';
	public tokens: Token[] = [];
	public lineBreaks: number[] = [];
	public searchResults: number[] = [];

	constructor(
		rawText: string,
		tokens: Token[],
		lineBreaks: number[],
		searchResults: number[] = [],
	) {
		this.rawText = rawText;
		this.tokens = tokens;
		this.lineBreaks = lineBreaks;
		this.searchResults = searchResults;
	}
}

export class Row {
	constructor(
		public line: number,
		public ord: number,
		public offset: number,
		public text: string,
		public tokens: Token[],
		public searchResults: number[],
	) {}
}
