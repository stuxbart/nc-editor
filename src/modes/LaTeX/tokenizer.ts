import { Document } from '../../document';
import DocumentNode from '../../document/document-node';
import { isAlpha, isAlphaNumeric, isWhiteSpaceChar, removeAccents } from '../../text-utils';
import { Token } from '../../tokenizer';
import { LaTeXTokens } from './tokens';
import { Tokenizer } from '../../tokenizer/tokenizer';
import TokenizerData, {
	compareLineData,
	TokenizerLineData,
	TokenizerLineState,
} from '../../tokenizer/tokenizer-data';

export default class LaTeXTokenizer extends Tokenizer {
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
			return { tokens: [], state: { ...prevLineState }, length: 0 };
		}

		const tokens: Token[] = [];
		const text = removeAccents(line.text);

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
