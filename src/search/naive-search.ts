import { Document } from '../document';
import { Range } from '../selection';
import { Search } from './search';
import SearchResult from './search-result';
import SearchResults from './search-results';

export default class NaiveSearch extends Search {
	public search(phrase: string, document: Document, searchResults: SearchResults): void {
		searchResults.clearResults();
		searchResults.phrase = phrase;
		if (!searchResults.caseSensitive) {
			phrase = phrase.toLowerCase();
		}
		for (let i = 0; i < document.linesCount; i++) {
			let line = document.getLine(i);
			if (!searchResults.caseSensitive) {
				line = line.toLowerCase();
			}
			const lineResults = this._searchInLine(phrase, line, i);
			const added = searchResults.addResults(lineResults);
			if (added !== lineResults.length) {
				break;
			}
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
		if (!searchResults.caseSensitive) {
			phrase = phrase.toLowerCase();
		}
		for (let i = 0; i < document.linesCount; i++) {
			if (!lines.has(i)) {
				continue;
			}
			let line = document.getLine(i);
			if (!searchResults.caseSensitive) {
				line = line.toLowerCase();
			}
			const lineResults = this._searchInLine(phrase, line, i);
			const added = searchResults.addResults(lineResults);
			if (added !== lineResults.length) {
				break;
			}
		}
	}

	public updateLineSearchResults(
		document: Document,
		searchResults: SearchResults,
		lineNumber: number,
	): void {
		let line: string = '';
		let phrase: string = searchResults.phrase;
		try {
			line = document.getLine(lineNumber);
		} catch (err) {
			return;
		}
		if (!searchResults.caseSensitive) {
			line = line.toLowerCase();
			phrase = searchResults.phrase.toLowerCase();
		}
		searchResults.clearLineResults(lineNumber);
		const lineResults = this._searchInLine(phrase, line, lineNumber);
		searchResults.addResults(lineResults);
	}

	public updateLinesSearchResults(
		document: Document,
		searchResults: SearchResults,
		firstLineNumber: number,
		linesCount: number,
	): void {
		searchResults.clearLinesResults(firstLineNumber, linesCount);
		for (let i = 0; i < linesCount; i++) {
			const lineNumber = firstLineNumber + i;
			let line: string;
			try {
				line = document.getLine(lineNumber);
			} catch (err) {
				return;
			}
			const lineResults = this._searchInLine(searchResults.phrase, line, lineNumber);
			const added = searchResults.addResults(lineResults);
			if (added !== lineResults.length) {
				break;
			}
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
		searchResults.applyLinesDelta(firstLineNumber, -removedLinesCount);
		this.updateLinesSearchResults(document, searchResults, firstLineNumber, removedLinesCount);
	}

	public findNextOccurence(
		document: Document,
		searchResults: SearchResults,
		startLineNumber: number,
		startOffset: number,
	): SearchResult | null {
		let phrase = searchResults.phrase;
		if (!searchResults.caseSensitive) {
			phrase = phrase.toLowerCase();
		}
		let res: SearchResult | null = null;
		for (let i = startLineNumber; i < document.linesCount; i++) {
			let line = document.getLine(i);
			if (i === startLineNumber) {
				line = line.substring(startOffset);
			}
			if (!searchResults.caseSensitive) {
				line = line.toLowerCase();
			}
			const lineResult = this._findNextInLine(phrase, line, i);
			if (lineResult) {
				let offsetDiff = 0;
				if (lineResult.start.line === startLineNumber) {
					offsetDiff = startOffset;
				}
				res = new SearchResult(
					lineResult.start.line,
					lineResult.start.offset + offsetDiff,
					lineResult.end.line,
					lineResult.end.offset + offsetDiff,
				);
				break;
			}
		}
		return res;
	}

	private _searchInLine(phrase: string, text: string, lineNumber: number): Range[] {
		if (phrase.length < 1) {
			return [];
		}
		const matches: Range[] = [];
		let index = 0;
		let startIndex = 0;
		while ((index = text.indexOf(phrase, startIndex)) > -1) {
			matches.push(new Range(lineNumber, index, lineNumber, index + phrase.length));
			startIndex = index + phrase.length;
		}
		return matches;
	}

	private _findNextInLine(phrase: string, text: string, lineNumber: number): Range | null {
		if (phrase.length < 1) {
			return null;
		}
		const index = text.indexOf(phrase);
		if (index === -1) {
			return null;
		}
		return new Range(lineNumber, index, lineNumber, index + phrase.length);
	}
}
