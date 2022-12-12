import { Document } from '../../document';
import DocumentNode from '../../document/document-node';
import { removeAccents } from '../../text-utils';
import { Token } from '../../tokenizer';
import { TokenType } from '../../tokenizer/token';
import { Tokenizer } from '../../tokenizer/tokenizer';
import TokenizerData, {
	TokenizerLineData,
	TokenizerLineState,
} from '../../tokenizer/tokenizer-data';

export default class JSTokenizer extends Tokenizer {
	public KEYWORDS = [
		'import',
		'from',
		'export',
		'default',
		'constructor',
		'return',
		'while',
		'for',
		'if',
		'switch',
		'default',
		'case',
		'break',
		'extends',
		'implements',
		'of',
		'in',
		'function',
	];

	public DEC_KEYWORDS = ['let', 'const', 'var', 'type', 'interface', 'class'];

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
		let prevState: TokenizerLineState;
		let lineData: TokenizerLineData;
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
			prevState = tokenizerData.data.get(line)?.state ?? { scope: '' };
			lineData = this._makeLineData(line, prevLineState);
			tokenizerData.data.set(line, lineData);
			i++;
		} while (prevState === lineData.state);
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
			const startIndex = i;
			while (i < text.length && this._isWhiteSpaceChar(text[i])) {
				i++;
			}
			if (i != startIndex) {
				tokens.push({
					type: TokenType.WHITE_SPACE,
					startIndex: startIndex,
				});
			}

			if (i === text.length) {
				break;
			}

			switch (text[i]) {
				case '(': {
					tokens.push({
						type: TokenType.OPEN_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case ')': {
					tokens.push({
						type: TokenType.CLOSE_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case '{': {
					tokens.push({ type: TokenType.OPEN_BRACE, startIndex: i });
					i++;
					break;
				}
				case '}': {
					tokens.push({ type: TokenType.CLOSE_BRACE, startIndex: i });
					i++;
					break;
				}
				case '[': {
					tokens.push({
						type: TokenType.OPEN_SQUARE_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case ']': {
					tokens.push({
						type: TokenType.CLOSE_SQUARE_BRACKET,
						startIndex: i,
					});
					i++;
					break;
				}
				case ':': {
					tokens.push({ type: TokenType.COLON, startIndex: i });
					i++;
					break;
				}
				case ';': {
					tokens.push({ type: TokenType.SEMICOLON, startIndex: i });
					i++;
					break;
				}
				case '.': {
					tokens.push({ type: TokenType.DOT, startIndex: i });
					i++;
					break;
				}
				case ',': {
					tokens.push({ type: TokenType.COMMA, startIndex: i });
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
					tokens.push({ type: TokenType.OPERATOR, startIndex: i });
					i++;
					break;
				}
				case '/': {
					if (i + 1 < text.length && text[i + 1] === '/') {
						tokens.push({ type: TokenType.COMMENT, startIndex: i });
						return { tokens: tokens, state: { scope: '' } };
					} else {
						tokens.push({
							type: TokenType.OPERATOR,
							startIndex: i,
						});
						i++;
						break;
					}
				}
				case "'": {
					const startIndex = i;
					// let tmp: string = '';
					i++;

					while (i < text.length && text[i] !== "'") {
						// tmp += text[i];
						i++;
					}
					tokens.push({
						type: TokenType.STRING_LITERAL,
						startIndex: startIndex,
					});
					i++;
					break;
				}
				case '"': {
					const startIndex = i;
					// let tmp: string = '';
					i++;

					while (i < text.length && text[i] !== '"') {
						// tmp += text[i];
						i++;
					}
					tokens.push({
						type: TokenType.STRING_LITERAL,
						startIndex: startIndex,
					});
					i++;
					break;
				}
				default: {
					let tmp: string = '';

					if (this._isAlpha(text[i])) {
						const startIndex = i;

						while (i < text.length && this._isAlphaNumeric(text[i])) {
							tmp += text[i];
							i++;
						}

						if (this._isKeyword(tmp)) {
							tokens.push({
								type: TokenType.KEYWORD,
								startIndex: startIndex,
							});
						} else if (this._isDecKeyword(tmp)) {
							tokens.push({
								type: TokenType.DEC_KEYWORD,
								startIndex: startIndex,
							});
						} else {
							tokens.push({
								type: TokenType.IDENTIFIER,
								startIndex: startIndex,
							});
						}
					} else if (this._isNumeric(text[i])) {
						tokens.push({ type: TokenType.NUMBER, startIndex: i });
						while (this._isNumeric(text[++i])) {
							/* empty */
						}
					} else {
						tokens.push({ type: TokenType.UNKNOWN, startIndex: i });
						i++;
					}
				}
			}
		}

		return { tokens: tokens, state: { scope: '' } };
	}

	private _isWhiteSpaceChar(char: string): boolean {
		return char === ' ' || char === '\t';
	}

	private _isAlpha(char: string): boolean {
		return /[_a-zA-Z]/.test(char);
	}

	private _isNumeric(char: string): boolean {
		return /^[0-9]+$/i.test(char);
	}

	private _isAlphaNumeric(char: string): boolean {
		return /^[_a-zA-Z0-9]+$/i.test(char);
	}
	private _isKeyword(str: string): boolean {
		if (str.length === 1) {
			return false;
		}
		for (const keyword of this.KEYWORDS) {
			if (keyword.includes(str) && keyword.length === str.length) {
				return true;
			}
		}
		return false;
	}

	private _isDecKeyword(str: string): boolean {
		if (str.length === 1) {
			return false;
		}
		for (const keyword of this.DEC_KEYWORDS) {
			if (keyword.includes(str) && keyword.length === str.length) {
				return true;
			}
		}
		return false;
	}
}
