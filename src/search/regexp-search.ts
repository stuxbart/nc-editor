import { Document } from '../document';
import { Range } from '../selection';
import { Search } from './search';
import SearchResults from './search-results';

export default class RegExpSearch extends Search {
	public search(phrase: string, document: Document, searchResults: SearchResults): void {
		searchResults.clearResults();
		searchResults.phrase = phrase;
		if (phrase.length === 0) {
			return;
		}
		let regexp;
		try {
			regexp = new RegExp(phrase, 'g');
		} catch (err: any) {
			return;
		}

		for (let i = 0; i < document.linesCount; i++) {
			const line = document.getLine(i);
			const lineResults = this._searchInLine(regexp, line, i);
			searchResults.addResults(lineResults);
		}
	}

	public searchInLines(
		phrase: string,
		document: Document,
		searchResults: SearchResults,
		lines: Set<number>,
	): void {
		searchResults.clearResults();
		searchResults.phrase = phrase;
		if (phrase.length === 0) {
			return;
		}
		let regexp;
		try {
			regexp = new RegExp(phrase, 'g');
		} catch (err: any) {
			return;
		}

		for (let i = 0; i < document.linesCount; i++) {
			if (!lines.has(i)) {
				continue;
			}
			const line = document.getLine(i);
			const lineResults = this._searchInLine(regexp, line, i);
			searchResults.addResults(lineResults);
		}
	}

	public updateLineSearchResults(
		document: Document,
		searchResults: SearchResults,
		lineNumber: number,
	): void {
		if (searchResults.phrase.length === 0) {
			return;
		}
		let line: string = '';
		try {
			line = document.getLine(lineNumber);
		} catch (err) {
			return;
		}
		let regexp;
		try {
			regexp = new RegExp(searchResults.phrase, 'g');
		} catch (err: any) {
			return;
		}
		searchResults.clearLineResults(lineNumber);
		const lineResults = this._searchInLine(regexp, line, lineNumber);
		searchResults.addResults(lineResults);
	}

	public updateLinesSearchResults(
		document: Document,
		searchResults: SearchResults,
		firstLineNumber: number,
		linesCount: number,
	): void {
		if (searchResults.phrase.length === 0) {
			return;
		}
		let regexp;
		try {
			regexp = new RegExp(searchResults.phrase, 'g');
		} catch (err: any) {
			return;
		}
		for (let i = 0; i < linesCount; i++) {
			const lineNumber = firstLineNumber + i;
			let line: string;
			try {
				line = document.getLine(lineNumber);
			} catch (err) {
				return;
			}
			searchResults.clearLineResults(lineNumber);
			const lineResults = this._searchInLine(regexp, line, lineNumber);
			searchResults.addResults(lineResults);
		}
	}

	public updateNewLinesSearchResults(
		document: Document,
		searchResults: SearchResults,
		firstLineNumber: number,
		newLinesCount: number,
	): void {
		searchResults.applyLinesDelta(firstLineNumber, newLinesCount);
		this.updateLinesSearchResults(document, searchResults, firstLineNumber, newLinesCount);
	}

	public updateRemovedLinesSearchResults(
		document: Document,
		searchResults: SearchResults,
		firstLineNumber: number,
		removedLinesCount: number,
	): void {
		searchResults.applyLinesDelta(firstLineNumber, removedLinesCount);
		this.updateLinesSearchResults(document, searchResults, firstLineNumber, removedLinesCount);
	}

	private _searchInLine(regexp: RegExp, text: string, lineNumber: number): Range[] {
		const matches: Range[] = [];
		const m = text.matchAll(regexp);
		for (const match of m) {
			if (match.index === undefined) {
				break;
			}
			if (match[0].length === 0) {
				continue;
			}
			matches.push(
				new Range(lineNumber, match.index, lineNumber, match.index + match[0].length),
			);
		}
		return matches;
	}
}
