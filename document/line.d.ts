import { Token } from '../tokenizer';
export default class Line {
    rawText: string;
    tokens: Token[];
    lineBreaks: number[];
    searchResults: number[];
    constructor(rawText: string, tokens: Token[], lineBreaks: number[], searchResults?: number[]);
}
export declare class Row {
    line: number;
    ord: number;
    offset: number;
    text: string;
    tokens: Token[];
    searchResults: number[];
    constructor(line: number, ord: number, offset: number, text: string, tokens: Token[], searchResults: number[]);
}
