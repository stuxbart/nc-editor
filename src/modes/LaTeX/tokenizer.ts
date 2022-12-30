import { Document } from '../../document';
import { isAlpha, isAlphaNumeric, isWhiteSpaceChar, removeAccents } from '../../text-utils';
import { Token } from '../../tokenizer';
import { LaTeXTokens } from './tokens';
import { Tokenizer } from '../../tokenizer/tokenizer';
import TokenizerData, {
	TokenizerLineData,
	TokenizerLineState,
} from '../../tokenizer/tokenizer-data';
import { compareLineData } from '../../tokenizer/utils';

export default class LaTeXTokenizer extends Tokenizer {
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
			const startIndex = i;
			while (i < text.length && isWhiteSpaceChar(text[i])) {
				i++;
			}
			if (i != startIndex) {
				tokens.push({
					type: LaTeXTokens.WHITE_SPACE,
					startIndex: startIndex,
				});
			}

			if (i === text.length) {
				break;
			}

			switch (text[i]) {
				case '(': {
					tokens.push({
						type: LaTeXTokens.OPEN_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case ')': {
					tokens.push({
						type: LaTeXTokens.CLOSE_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case '{': {
					tokens.push({ type: LaTeXTokens.OPEN_BRACE, startIndex: i });
					i++;
					break;
				}
				case '}': {
					tokens.push({ type: LaTeXTokens.CLOSE_BRACE, startIndex: i });
					i++;
					break;
				}
				case '[': {
					tokens.push({
						type: LaTeXTokens.OPEN_SQUARE_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case ']': {
					tokens.push({
						type: LaTeXTokens.CLOSE_SQUARE_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case '%': {
					tokens.push({ type: LaTeXTokens.COMMENT, startIndex: i });
					return { tokens: tokens, state: { scope: '' }, length: text.length };
				}
				case '$': {
					const startIndex = i;
					i++;

					while (i < text.length && text[i] !== '$') {
						i++;
					}
					tokens.push({
						type: LaTeXTokens.EQUATION,
						startIndex: startIndex,
					});
					i++;
					break;
				}
				case '\\': {
					const startIndex = i;
					i++;

					while (i < text.length && isAlpha(text[i])) {
						i++;
					}
					tokens.push({
						type: LaTeXTokens.COMMAND,
						startIndex: startIndex,
					});
					// i++;
					break;
				}
				default: {
					const startIndex = i;
					if (isAlphaNumeric(text[i])) {
						while (i < text.length && isAlphaNumeric(text[i])) {
							console.log(i, text[i]);
							i++;
						}
						tokens.push({
							type: LaTeXTokens.WORD,
							startIndex: startIndex,
						});
					} else {
						tokens.push({ type: LaTeXTokens.UNKNOWN, startIndex: i });
						i++;
					}
				}
			}
		}

		return { tokens: tokens, state: { scope: '' }, length: text.length };
	}
}
