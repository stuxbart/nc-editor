import { Range } from '../selection';
import SearchResult from './search-result';
export interface SearchLineResults {
    lineNumber: number;
    matches: number[];
    count: number;
    activeSearchRes: number;
}
export default class SerachResults {
    private _results;
    private _searchPhrase;
    private _activeSearchRes;
    caseSensitive: boolean;
    searchInSelection: boolean;
    maxResultsCount: number;
    private get _totalResults();
    get results(): Range[];
    get matchCount(): number;
    get activeSearchResultNumber(): number;
    set activeSearchResultNumber(value: number);
    nextResult(): number;
    prevResult(): number;
    getLineResutls(lineNumber: number): SearchResult[];
    getLinesResutls(lineNumber: number, linesCount: number): SearchResult[];
    clearLineResults(lineNumber: number): void;
    clearLinesResults(lineNumber: number, linesCount: number): void;
    addResult(res: Range): number;
    addResults(res: Range[]): number;
    getActiveSearchResPosition(): SearchResult;
    clearResults(): void;
    get phrase(): string;
    set phrase(value: string);
    applyLinesDelta(lineNumber: number, linesCount: number): void;
}
