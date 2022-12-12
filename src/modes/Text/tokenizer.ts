import { Document } from '../../document';
import DocumentNode from '../../document/document-node';
import { removeAccents } from '../../text-utils';
import { Token } from '../../tokenizer';
import { TextTokens } from './tokens';
import { Tokenizer } from '../../tokenizer/tokenizer';
import TokenizerData, {
	compareLineData,
	TokenizerLineData,
	TokenizerLineState,
} from '../../tokenizer/tokenizer-data';

export default class TextTokenizer extends Tokenizer {
	public tokenize(document: Document, tokenizerData: TokenizerData): void {
		let line: DocumentNode | null = document.getFirstLineNode();
		let i = 1;
		let prevState: TokenizerLineState = { scope: '' };
		while (line !== null) {
			const lineData = this._makeLineData(line, prevState);
			tokenizerData.data.set(line, lineData);
			prevState = lineData.state;
			line = document.getLineNode(i);
			i++;
		}
	}

	public updateTokens(
		document: Document,
		tokenizerData: TokenizerData,
		lineNumber: number,
	): void {
		let line: DocumentNode | null;
		let i = lineNumber;
		let prevLineState: TokenizerLineState | undefined;
		let lineData: TokenizerLineData;
		let prevData: TokenizerLineData | undefined;
		do {
			line = document.getLineNode(lineNumber - 1);
			if (line === null) {
				prevLineState = { scope: '' };
			} else {
				prevLineState = tokenizerData.data.get(line)?.state ?? { scope: '' };
			}
			line = document.getLineNode(i);
			if (line === null) {
				break;
			}
			prevData = tokenizerData.data.get(line);
			lineData = this._makeLineData(line, prevLineState);
			tokenizerData.data.set(line, lineData);
			i++;
		} while (!prevData || !compareLineData(prevData, lineData));
	}

	private _makeLineData(
		line: DocumentNode,
		prevLineState: TokenizerLineState,
	): TokenizerLineData {
		if (line.text.length === 0) {
			return { tokens: [], state: { ...prevLineState } };
		}

		const tokens: Token[] = [];
		const text = removeAccents(line.text);

		let i = 0;
		while (i < text.length) {
			let startIndex = i;
			while (i < text.length && this._isWhiteSpaceChar(text[i])) {
				i++;
			}
			if (i != startIndex) {
				tokens.push({
					type: TextTokens.WHITE_SPACE,
					startIndex: startIndex,
				});
			}
			startIndex = i;
			while (i < text.length && !this._isWhiteSpaceChar(text[i])) {
				i++;
			}
			if (i != startIndex) {
				tokens.push({
					type: TextTokens.WORD,
					startIndex: startIndex,
				});
			}
		}

		return { tokens: tokens, state: { scope: '' } };
	}

	private _isWhiteSpaceChar(char: string): boolean {
		return char === ' ' || char === '\t';
	}
}
