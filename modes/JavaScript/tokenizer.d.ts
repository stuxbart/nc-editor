import { Document } from '../../document';
import { Tokenizer } from '../../tokenizer/tokenizer';
import TokenizerData from '../../tokenizer/tokenizer-data';
export default class JSTokenizer extends Tokenizer {
    KEYWORDS: string[];
    ACCESS_MODIFIRES: string[];
    LITERALS: string[];
    DEC_KEYWORDS: string[];
    BASE_TYPES: string[];
    tokenize(document: Document, tokenizerData: TokenizerData): void;
    updateTokens(document: Document, tokenizerData: TokenizerData, lineNumber: number): void;
    private _makeLineData;
    private _isWordInList;
}
