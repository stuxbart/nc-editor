import { Document } from '../../document';
import {
	isAlpha,
	isAlphaNumeric,
	isNumeric,
	isWhiteSpaceChar,
	removeAccents,
} from '../../text-utils';
import { Token } from '../../tokenizer';
import { JSTokens } from './tokens';
import { Tokenizer } from '../../tokenizer/tokenizer';
import TokenizerData, {
	TokenizerLineData,
	TokenizerLineState,
} from '../../tokenizer/tokenizer-data';
import { compareLineData } from '../../tokenizer/utils';

export default class JSTokenizer extends Tokenizer {
	public KEYWORDS = [
		'abstract',
		'await',
		'break',
		'case',
		'catch',
		'continue',
		'debugger',
		'default',
		'do',
		'else',
		'enum',
		'export',
		'extends',
		'finally',
		'for',
		'from',
		'function',
		'goto',
		'if',
		'implements',
		'import',
		'in',
		'package',
		'return',
		'switch',
		'throw',
		'try',
		'while',
		'with',
		'yield',
	];
	public ACCESS_MODIFIRES = ['public', 'private', 'protected', 'static'];
	public LITERALS = [
		'true',
		'false',
		'null',
		'void',
		'this',
		'constructor',
		'Infinity',
		'super',
		'NaN',
		'undefined',
	];
	public DEC_KEYWORDS = [
		'let',
		'const',
		'var',
		'type',
		'interface',
		'class',
		'delete',
		'new',
		'interface',
		'instanceof',
		'typeof',
	];
	public BASE_TYPES = ['Array', 'Date', 'Math', 'Number', 'Object', 'String'];

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
					type: JSTokens.WHITE_SPACE,
					startIndex: startIndex,
				});
			}

			if (i === text.length) {
				break;
			}

			switch (text[i]) {
				case '(': {
					tokens.push({
						type: JSTokens.OPEN_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case ')': {
					tokens.push({
						type: JSTokens.CLOSE_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case '{': {
					tokens.push({ type: JSTokens.OPEN_BRACE, startIndex: i });
					i++;
					break;
				}
				case '}': {
					tokens.push({ type: JSTokens.CLOSE_BRACE, startIndex: i });
					i++;
					break;
				}
				case '[': {
					tokens.push({
						type: JSTokens.OPEN_SQUARE_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case ']': {
					tokens.push({
						type: JSTokens.CLOSE_SQUARE_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case ':': {
					tokens.push({ type: JSTokens.COLON, startIndex: i });
					i++;
					break;
				}
				case ';': {
					tokens.push({ type: JSTokens.SEMICOLON, startIndex: i });
					i++;
					break;
				}
				case '.': {
					tokens.push({ type: JSTokens.DOT, startIndex: i });
					i++;
					break;
				}
				case ',': {
					tokens.push({ type: JSTokens.COMMA, startIndex: i });
					i++;
					break;
				}
				case '+':
				case '-':
				case '*':
				case '=':
				case '!':
				case '&':
				case '|':
				case '<':
				case '>':
				case '?': {
					tokens.push({ type: JSTokens.OPERATOR, startIndex: i });
					i++;
					break;
				}
				case '/': {
					if (i + 1 < text.length && text[i + 1] === '/') {
						tokens.push({ type: JSTokens.COMMENT, startIndex: i });
						return { tokens: tokens, state: { scope: '' }, length: text.length };
					} else {
						tokens.push({
							type: JSTokens.OPERATOR,
							startIndex: i,
						});
						i++;
						break;
					}
				}
				case "'": {
					const startIndex = i;
					i++;

					while (i < text.length && text[i] !== "'") {
						i++;
					}
					tokens.push({
						type: JSTokens.STRING_LITERAL,
						startIndex: startIndex,
					});
					i++;
					break;
				}
				case '"': {
					const startIndex = i;
					i++;

					while (i < text.length && text[i] !== '"') {
						i++;
					}
					tokens.push({
						type: JSTokens.STRING_LITERAL,
						startIndex: startIndex,
					});
					i++;
					break;
				}
				case '`': {
					const startIndex = i;
					i++;

					while (i < text.length && text[i] !== '`') {
						i++;
					}
					tokens.push({
						type: JSTokens.STRING_LITERAL,
						startIndex: startIndex,
					});
					i++;
					break;
				}
				default: {
					let tmp: string = '';

					if (isAlpha(text[i])) {
						const startIndex = i;

						while (i < text.length && isAlphaNumeric(text[i])) {
							tmp += text[i];
							i++;
						}

						if (this._isWordInList(tmp, this.KEYWORDS)) {
							tokens.push({
								type: JSTokens.KEYWORD,
								startIndex: startIndex,
							});
						} else if (this._isWordInList(tmp, this.DEC_KEYWORDS)) {
							tokens.push({
								type: JSTokens.DEC_KEYWORD,
								startIndex: startIndex,
							});
						} else if (this._isWordInList(tmp, this.BASE_TYPES)) {
							tokens.push({
								type: JSTokens.TYPE,
								startIndex: startIndex,
							});
						} else if (this._isWordInList(tmp, this.LITERALS)) {
							tokens.push({
								type: JSTokens.CONST_VALUE,
								startIndex: startIndex,
							});
						} else if (this._isWordInList(tmp, this.ACCESS_MODIFIRES)) {
							tokens.push({
								type: JSTokens.ACCESS_MODIFIER,
								startIndex: startIndex,
							});
						} else {
							tokens.push({
								type: JSTokens.IDENTIFIER,
								startIndex: startIndex,
							});
						}
					} else if (isNumeric(text[i])) {
						tokens.push({ type: JSTokens.NUMBER, startIndex: i });
						while (isNumeric(text[++i])) {
							/* empty */
						}
					} else {
						tokens.push({ type: JSTokens.UNKNOWN, startIndex: i });
						i++;
					}
				}
			}
		}

		return { tokens: tokens, state: { scope: '' }, length: text.length };
	}

	private _isWordInList(word: string, words: string[]): boolean {
		if (word.length === 1) {
			return false;
		}
		for (const patternWord of words) {
			if (patternWord.includes(word) && patternWord.length === word.length) {
				return true;
			}
		}
		return false;
	}
}
