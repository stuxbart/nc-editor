import { Document } from '../../document';
import { Tokenizer } from '../../tokenizer/tokenizer';
import TokenizerData from '../../tokenizer/tokenizer-data';
export default class LaTeXTokenizer extends Tokenizer {
    tokenize(document: Document, tokenizerData: TokenizerData): void;
    updateTokens(document: Document, tokenizerData: TokenizerData, firstLineNumber: number): void;
    private _makeLineData;
}
