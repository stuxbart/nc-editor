import { Document } from '../../document';
import DocumentNode from '../../document/document-node';
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
	compareLineData,
	TokenizerLineData,
	TokenizerLineState,
} from '../../tokenizer/tokenizer-data';

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
