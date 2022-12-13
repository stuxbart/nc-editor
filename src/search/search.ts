import Document from '../document/document';
import SearchResults from './search-results';

export abstract class Search {
	public abstract search(phrase: string, document: Document, searchResults: SearchResults): void;

	public abstract updateSearchResults(
		document: Document,
		searchResults: SearchResults,
		lineNumber: number,
	): void;
}
