import { Document } from '../../document';
import { removeAccents } from '../../text-utils';
import { Token } from '../../tokenizer';
import { TextTokens } from './tokens';
import { Tokenizer } from '../../tokenizer/tokenizer';
import TokenizerData, {
	TokenizerLineData,
	TokenizerLineState,
} from '../../tokenizer/tokenizer-data';
import { compareLineData } from '../../tokenizer/utils';

export default class TextTokenizer extends Tokenizer {
	public tokenize(document: Document, tokenizerData: TokenizerData): void {
		tokenizerData.clear();
		let prevState: TokenizerLineState = { scope: '' };

		for (let i = 0; i < document.linesCount; i++) {
			const line = document.getLine(i);
			const lineData = this._makeLineData(line, prevState);
			tokenizerData.insertLine(lineData, i);
			prevState = lineData.state;
		}
	}

	public updateTokens(
		document: Document,
		tokenizerData: TokenizerData,
		firstLineNumber: number,
	): void {
		if (document.linesCount !== tokenizerData.linesCount) {
			const diff = document.linesCount - tokenizerData.linesCount;
			for (let i = 0; i < diff; i++) {
				tokenizerData.insertLine(
					{ tokens: [], state: { scope: '' }, length: 0 },
					firstLineNumber + i,
				);
			}
		}
		let line: string;
		let i = firstLineNumber;
		let prevLineState: TokenizerLineState = tokenizerData.getLineData(i - 1).state;
		let lineData: TokenizerLineData;
		let prevData: TokenizerLineData;
		do {
			line = document.getLine(i);
			prevData = tokenizerData.getLineData(i);
			lineData = this._makeLineData(line, prevLineState);
			tokenizerData.setLineData(i, lineData);
			prevLineState = { scope: '' };
			i++;
		} while (!compareLineData(prevData, lineData));
	}

	private _makeLineData(line: string, prevLineState: TokenizerLineState): TokenizerLineData {
		if (line.length === 0) {
			return { tokens: [], state: { ...prevLineState }, length: 0 };
		}

		const tokens: Token[] = [];
		const text = removeAccents(line);

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

		return { tokens: tokens, state: { scope: '' }, length: text.length };
	}

	private _isWhiteSpaceChar(char: string): boolean {
		return char === ' ' || char === '\t';
	}
}
