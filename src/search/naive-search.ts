import { Document } from '../document';
import { Range } from '../selection';
import { Search } from './search';
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
			searchResults.addResults(lineResults);
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
		searchResults.applyLinesDelta(firstLineNumber, -removedLinesCount);
		this.updateLinesSearchResults(document, searchResults, firstLineNumber, removedLinesCount);
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
}
