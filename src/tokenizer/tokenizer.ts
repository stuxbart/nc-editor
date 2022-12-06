import Document from '../document/document';
import DocumentNode from '../document/document-node';
import { removeAccents } from '../text-utils';
import { Token, TokenType } from './token';

export default class Tokenizer {
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
	private _data: WeakMap<DocumentNode, Token[]>;
	private _doc: Document | null = null;

	constructor(doc: Document, tokenize: boolean = false) {
		this._data = new WeakMap<DocumentNode, Token[]>();
		this._doc = doc;

		if (tokenize) {
			this.makeTokens();
		}
	}

	public makeTokens(): void {
		if (this._doc === null) {
			return;
		}
		this._data = new WeakMap<DocumentNode, Token[]>();
		let line: DocumentNode | null = this._doc.getFirstLineNode();
		let i = 1;
		while (line !== null) {
			const tokens = this.tokenize(line);
			this._data.set(line, tokens);
			line = this._doc.getLineNode(i);
			i++;
		}
	}

	public updateLinesTokens(firstLine: number, linesCount: number): void {
		if (this._doc === null) {
			return;
		}
		let line: DocumentNode | null = this._doc.getLineNode(firstLine);
		let i = 0;
		while (line !== null && i < linesCount) {
			const tokens = this.tokenize(line);
			this._data.set(line, tokens);
			line = this._doc.getLineNode(firstLine + i + 1);
			i++;
		}
	}

	public updateLineTokes(lineNumber: number): void {
		if (this._doc === null) {
			return;
		}
		const line: DocumentNode | null = this._doc.getLineNode(lineNumber);
		if (line === null) {
			return;
		}
		const tokens = this.tokenize(line);
		this._data.set(line, tokens);
	}

	public tokenize(line: DocumentNode | null): Token[] {
		if (line === null) {
			return [];
		}
		if (line.text.length === 0) {
			return [];
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
						return tokens;
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

		return tokens;
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

	public getTokensForLine(lineNode: DocumentNode): Token[] {
		if (this._data.has(lineNode)) {
			return this._data.get(lineNode) ?? [];
		}
		return [];
	}
}
