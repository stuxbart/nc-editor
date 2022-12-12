import Document from '../document/document';
import TokenizerData from './tokenizer-data';
export declare abstract class Tokenizer {
    abstract tokenize(document: Document, tokenizerData: TokenizerData): void;
    abstract updateTokens(document: Document, tokenizerData: TokenizerData, lineNumber: number): void;
}
