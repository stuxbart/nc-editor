import { Token } from './token';
export interface TokenizerLineState {
    scope: string;
}
export interface TokenizerLineData {
    tokens: Token[];
    state: TokenizerLineState;
    length: number;
}
export default class TokenizerData {
    private _tree;
    constructor();
    get linesCount(): number;
    getLineData(lineNumber: number): TokenizerLineData;
    getLinesData(firstLine: number, linesCount: number): TokenizerLineData[];
    setLineData(lineNumber: number, data: TokenizerLineData): void;
    getLineTokens(lineNumber: number): Token[];
    getLinesTokens(firstLine: number, linesCount: number): Token[][];
    clear(): void;
    insertLine(data: TokenizerLineData, lineNumber: number): void;
}
