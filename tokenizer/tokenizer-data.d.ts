import DocumentNode from '../document/document-node';
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
    private _data;
    constructor();
    get data(): WeakMap<DocumentNode, TokenizerLineData>;
    getLineData(lineNode: DocumentNode): TokenizerLineData;
    getLineTokens(lineNode: DocumentNode): Token[];
}
export declare function compareLineData(line1: TokenizerLineData, line2: TokenizerLineData): boolean;
