import { Document } from '../document';
import { Search } from './search';
import SearchResult from './search-result';
import SearchResults from './search-results';
export default class RegExpSearch extends Search {
    search(phrase: string, document: Document, searchResults: SearchResults): void;
    searchInLines(phrase: string, document: Document, searchResults: SearchResults, lines: Set<number>): void;
    updateLineSearchResults(document: Document, searchResults: SearchResults, lineNumber: number): void;
    updateLinesSearchResults(document: Document, searchResults: SearchResults, firstLineNumber: number, linesCount: number): void;
    updateNewLinesSearchResults(document: Document, searchResults: SearchResults, firstLineNumber: number, newLinesCount: number): void;
    updateRemovedLinesSearchResults(document: Document, searchResults: SearchResults, firstLineNumber: number, removedLinesCount: number): void;
    findNextOccurence(document: Document, searchResults: SearchResults, startLineNumber: number, startOffset: number): SearchResult | null;
    private _searchInLine;
    private _findNextInLine;
    private _compileRegExp;
}
