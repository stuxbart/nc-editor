import Document from '../document/document';
import SearchResults from './search-results';
export declare abstract class Search {
    abstract search(phrase: string, document: Document, searchResults: SearchResults): void;
    abstract updateSearchResults(document: Document, searchResults: SearchResults, lineNumber: number): void;
}
