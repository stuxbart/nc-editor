import Document from '../document/document';
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
}
