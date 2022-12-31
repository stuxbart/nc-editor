import { Document } from '../document';
import { Search } from './search';
import SearchResults, { SearchLineResults } from './search-results';

export default class NaiveSearch extends Search {
	public search(phrase: string, document: Document, searchResults: SearchResults): void {
		searchResults.clearResults();
		let totalMatches = 0;
		for (let i = 0; i < document.linesCount; i++) {
			const line = document.getLine(i);
			const lineResults = this._searchInLine(phrase, line);
			totalMatches += lineResults.count;
			searchResults.results.set(i, lineResults);
		}
		searchResults.matchCount = totalMatches;
		searchResults.phrase = phrase;
		searchResults.activeSearchResult = 0;
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

		const prevResults = searchResults.results.get(lineNumber);
		if (prevResults) {
			searchResults.matchCount -= prevResults.count;
			searchResults.results.delete(lineNumber);
		}
		const lineResults = this._searchInLine(searchResults.phrase, line);
		searchResults.matchCount += lineResults.count;
		searchResults.results.set(lineNumber, lineResults);
	}

	private _searchInLine(phrase: string, text: string): SearchLineResults {
		if (phrase.length < 1) {
			return { matches: [], count: 0 };
		}
		const matches: number[] = [];
		let index = 0;
		let startIndex = 0;
		while ((index = text.indexOf(phrase, startIndex)) > -1) {
			matches.push(index);
			startIndex = index + phrase.length;
		}
		return { matches: matches, count: matches.length };
	}
}
