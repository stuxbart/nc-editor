import Document from '../document/document';
import TokenizerData from './tokenizer-data';

export abstract class Tokenizer {
	public abstract tokenize(document: Document, tokenizerData: TokenizerData): void;

	public abstract updateTokens(
		document: Document,
		tokenizerData: TokenizerData,
		lineNumber: number,
	): void;
}
