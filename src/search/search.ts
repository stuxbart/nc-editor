import Document from '../document/document';
import SearchResult from './search-result';
import SearchResults from './search-results';

export abstract class Search {
	public abstract search(phrase: string, document: Document, searchResults: SearchResults): void;

	public abstract searchInLines(
		phrase: string,
		document: Document,
		searchResults: SearchResults,
		lines: Set<number>,
	): void;

	public abstract updateLineSearchResults(
		document: Document,
		searchResults: SearchResults,
		lineNumber: number,
	): void;

	public abstract updateLinesSearchResults(
		document: Document,
		searchResults: SearchResults,
		firstLineNumber: number,
		linesCount: number,
	): void;

	public abstract updateNewLinesSearchResults(
		document: Document,
		searchResults: SearchResults,
		firstLineNumber: number,
		newLinesCount: number,
	): void;

	public abstract updateRemovedLinesSearchResults(
		document: Document,
		searchResults: SearchResults,
		firstLineNumber: number,
		removedLinesCount: number,
	): void;

	public abstract findNextOccurence(
		document: Document,
		searchResults: SearchResults,
		startLineNumber: number,
		startOffset: number,
	): SearchResult | null;
}
