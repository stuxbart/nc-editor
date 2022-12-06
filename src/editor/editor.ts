import Document from '../document/document';
import { Selection } from '../selection';

/**
 * Editor class manages state of editor.
 */
class Editor {
	private _selections: Selection[] = [];
	private _document: Document | null = null;

	constructor() {
		const newDoc = new Document('');
		this._document = newDoc;
		this._selections = [new Selection(0, 0, 0, 0)];
	}

	public insert(str: string, line: number, offset: number): void {
		if (this._document === null) {
			return;
		}
		this._document.insert(str, line, offset);
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
		this._document.remove(sel);
	}

	public setDocument(document: Document): void {
		this._document = document;
	}

	public getText(): string {
		return this._document?.getText() ?? '';
	}
}

export default Editor;
