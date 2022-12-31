import { Document } from '../document';
import { Search } from './search';
import SearchResults from './search-results';

export default class NaiveSearch extends Search {
	public search(phrase: string, document: Document, searchResults: SearchResults): void {
		searchResults.clearResults();
		if (!searchResults.caseSensitive) {
			phrase = phrase.toLowerCase();
		}
		for (let i = 0; i < document.linesCount; i++) {
			let line = document.getLine(i);
			if (!searchResults.caseSensitive) {
				line = line.toLowerCase();
			}
			const lineResults = this._searchInLine(phrase, line);
			searchResults.setLineResults(i, lineResults);
		}
		searchResults.phrase = phrase;
	}

	public updateSearchResults(
		document: Document,
		searchResults: SearchResults,
		lineNumber: number,
	): void {
		let line: string;
		try {
			line = document.getLine(lineNumber);
		} catch (err) {
			return;
		}

		const lineResults = this._searchInLine(searchResults.phrase, line);
		searchResults.setLineResults(lineNumber, lineResults, true);
	}

	private _searchInLine(phrase: string, text: string): number[] {
		if (phrase.length < 1) {
			return [];
		}
		const matches: number[] = [];
		let index = 0;
		let startIndex = 0;
		while ((index = text.indexOf(phrase, startIndex)) > -1) {
			matches.push(index);
			startIndex = index + phrase.length;
		}
		return matches;
	}
}
