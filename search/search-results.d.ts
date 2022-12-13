import DocumentNode from '../document/document-node';
export interface SearchLineResults {
    matches: number[];
    count: number;
}
export default class SerachResults {
    private _results;
    private _totalResults;
    private _searchPhrase;
    constructor();
    get results(): WeakMap<DocumentNode, SearchLineResults>;
    get matchCount(): number;
    set matchCount(value: number);
    getLineResutls(lineNode: DocumentNode): SearchLineResults;
    clearResults(): void;
    get phrase(): string;
    set phrase(value: string);
}
