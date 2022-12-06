import Document from '../document/document';
import { Selection } from '../selection';
import { Tokenizer } from '../tokenizer';

/**
 * Editor class manages state of editor.
 */
class Editor {
	private _selections: Selection[] = [];
	private _document: Document | null = null;
	private _tokenizeAfterEdit: boolean = false;
	private _tokenizer: Tokenizer;

	constructor() {
		const newDoc = new Document('');
		this._document = newDoc;
		this._selections = [new Selection(0, 0, 0, 0)];
		this._tokenizer = new Tokenizer(this._document, false);
	}

	public insert(str: string, line: number, offset: number): void {
		if (this._document === null) {
			return;
		}
		const insertedLines = this._document.insert(str, line, offset);
		this._updateLinesTokens(line, insertedLines[0] + 1);
	}

	public remove(type: number = 0): void {
		if (this._document === null) {
			return;
		}
		const sel = this._selections[0];
		if (sel.isCollapsed) {
			if (type === 1) {
				sel.end.offset = sel.end.offset + 1;
			} else {
				sel.start.offset = sel.start.offset - 1;
			}
		}
		this._updateLinesTokens(sel.start.line, 2);
		this._document.remove(sel);
	}

	public setDocument(document: Document): void {
		this._document = document;
		this.tokenize();
	}

	public getText(): string {
		return this._document?.getText() ?? '';
	}

	public tokenize(): void {
		if (this._document === null) {
			return;
		}
		this._tokenizer.setDocument(this._document);
		this._tokenizer.makeTokens();
	}

	private _updateLinesTokens(firstLine: number, linesCount: number): void {
		if (this._tokenizeAfterEdit) {
			this._tokenizer.updateLinesTokens(firstLine, linesCount);
		}
	}
}

export default Editor;
