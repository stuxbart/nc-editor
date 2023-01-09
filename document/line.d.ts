import SearchResult from '../search/search-result';
import { Token } from '../tokenizer';
export default class Line {
    rawText: string;
    tokens: Token[];
    lineBreaks: number[];
    searchResults: SearchResult[];
    constructor(rawText: string, tokens: Token[], lineBreaks: number[], searchResults?: SearchResult[]);
}
export declare class Row {
    line: number;
    ord: number;
    offset: number;
    text: string;
    tokens: Token[];
    searchResults: SearchResult[];
    constructor(line: number, ord: number, offset: number, text: string, tokens: Token[], searchResults: SearchResult[]);
}
