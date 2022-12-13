import { Document } from '../document';
import { Search } from './search';
import SearchResults from './search-results';
export default class NaiveSearch extends Search {
    search(phrase: string, document: Document, searchResults: SearchResults): void;
    updateSearchResults(document: Document, searchResults: SearchResults, lineNumber: number): void;
    private _searchInLine;
}
