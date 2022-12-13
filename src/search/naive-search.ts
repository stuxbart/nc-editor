import { Document } from '../document';
import DocumentNode from '../document/document-node';
import { Search } from './search';
import SearchResults, { SearchLineResults } from './search-results';

export default class NaiveSearch extends Search {
	public search(phrase: string, document: Document, searchResults: SearchResults): void {
		searchResults.clearResults();
		let line: DocumentNode | null = document.getFirstLineNode();
		let i = 1;
		let totalMatches = 0;
		while (line !== null) {
			const lineResults = this._searchInLine(phrase, line.text);
			totalMatches += lineResults.count;
			searchResults.results.set(line, lineResults);
			line = document.getLineNode(i);
			i++;
		}
		searchResults.matchCount = totalMatches;
		searchResults.phrase = phrase;
	}

	public updateSearchResults(
		document: Document,
		searchResults: SearchResults,
		lineNumber: number,
	): void {
		const line: DocumentNode | null = document.getLineNode(lineNumber);
		if (line === null) {
			return;
		}
		const prevResults = searchResults.results.get(line);
		if (prevResults) {
			searchResults.matchCount -= prevResults.count;
			searchResults.results.delete(line);
		}
		const lineResults = this._searchInLine(searchResults.phrase, line.text);
		searchResults.matchCount += lineResults.count;
		searchResults.results.set(line, lineResults);
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
