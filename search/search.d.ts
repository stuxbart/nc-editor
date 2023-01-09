import Document from '../document/document';
import SearchResult from './search-result';
import SearchResults from './search-results';
export declare abstract class Search {
    abstract search(phrase: string, document: Document, searchResults: SearchResults): void;
    abstract searchInLines(phrase: string, document: Document, searchResults: SearchResults, lines: Set<number>): void;
    abstract updateLineSearchResults(document: Document, searchResults: SearchResults, lineNumber: number): void;
    abstract updateLinesSearchResults(document: Document, searchResults: SearchResults, firstLineNumber: number, linesCount: number): void;
    abstract updateNewLinesSearchResults(document: Document, searchResults: SearchResults, firstLineNumber: number, newLinesCount: number): void;
    abstract updateRemovedLinesSearchResults(document: Document, searchResults: SearchResults, firstLineNumber: number, removedLinesCount: number): void;
    abstract findNextOccurence(document: Document, searchResults: SearchResults, startLineNumber: number, startOffset: number): SearchResult | null;
}
