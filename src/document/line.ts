import SearchResult from '../search/search-result';
import { Token } from '../tokenizer';

export default class Line {
	public rawText: string = '';
	public tokens: Token[] = [];
	public lineBreaks: number[] = [];
	public searchResults: SearchResult[] = [];

	constructor(
		rawText: string,
		tokens: Token[],
		lineBreaks: number[],
		searchResults: SearchResult[] = [],
	) {
		this.rawText = rawText;
		this.tokens = tokens;
		this.lineBreaks = lineBreaks;
		this.searchResults = searchResults;
	}
}

export class Row {
	constructor(
		public number: number,
		public line: number,
		public ord: number,
		public offset: number,
		public text: string,
		public tokens: Token[],
		public searchResults: SearchResult[],
	) {}
}

export function rowCompare(r1: Row, r2: Row): boolean {
	if (r1.number !== r2.number) {
		return false;
	}
	if (r1.line !== r2.line) {
		return false;
	}
	if (r1.ord !== r2.ord) {
		return false;
	}
	if (r1.offset !== r2.offset) {
		return false;
	}
	if (r1.text !== r2.text) {
		return false;
	}
	if (r1.tokens.length !== r2.tokens.length) {
		return false;
	}
	return true;
}
