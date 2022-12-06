import { Line } from '../document';
import Document from '../document/document';
import { EventEmitter } from '../events';
import { Selection } from '../selection';
import { Tokenizer } from '../tokenizer';
import { EditorEvents, EvDocument, EvSelection, EvTokenizer } from './events';

/**
 * Editor class manages state of editor.
 */
class Editor extends EventEmitter<EditorEvents> {
	private _selections: Selection[] = [];
	private _document: Document | null = null;
	private _tokenizeAfterEdit: boolean = false;
	private _tokenizer: Tokenizer;

	private _shouldEmitEditEvent: boolean = true;
	private _shouldEmitLinesCountChangeEvent: boolean = true;

	constructor() {
		super();
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
		this._updateSelctions(line, offset, insertedLines[0], insertedLines[1]);
		this._emitEditEvent();
		this._emitLinesCountChanged(insertedLines[0]);
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
		this._updateLinesTokens(sel.start.line, 2);
		this._updateSelctions(sel.start.line, sel.start.offset + 1, 0, -1);
		this._emitEditEvent();
		this._emitLinesCountChanged(sel.end.line - sel.start.line);
	}

	public setDocument(document: Document): void {
		this._document = document;
		this.tokenize();
		this.emit(EvDocument.Set, undefined);
		this._emitLinesCountChanged(Infinity);
	}

	public getText(): string {
		return this._document?.getText() ?? '';
	}

	public getTotalLinesCount(): number {
		return this._document?.linesCount ?? 0;
	}

	/**
	 * Combines text data with tokenization result.
	 * @param firstLine number of first line
	 * @param count count of lines to read
	 * @returns list of lines with tokenization data
	 */
	public getLines(firstLine: number, count: number): Line[] {
		if (this._document === null) {
			return [];
		}
		const rawLines = this._document.getLineNodes(firstLine, count);
		const lines: Line[] = [];
		for (const line of rawLines) {
			lines.push({
				rawText: line.text,
				tokens: this._tokenizer.getTokensForLine(line),
				lineBreaks: [],
			});
		}
		return lines;
	}

	public tokenize(): void {
		if (this._document === null) {
			return;
		}
		this._tokenizer.setDocument(this._document);
		this._tokenizer.makeTokens();
		this.emit(EvTokenizer.Finished, undefined);
	}

	public getSelctions(): Selection[] {
		return this._selections;
	}

	public setSelection(selection: Selection): void {
		this._selections = [selection];
		this._emitSelectionChangedEvent();
	}

	public addSelection(selection: Selection): void {
		this._selections.push(selection);
		this._emitSelectionChangedEvent();
	}

	private _updateSelctions(
		line: number,
		offset: number,
		lineDiff: number,
		offsetDiff: number,
	): void {
		for (const selection of this._selections) {
			if (selection.start.line === line && selection.start.offset >= offset) {
				if (lineDiff > 0) {
					selection.start.line += lineDiff;
					selection.start.offset = selection.start.offset - offset + offsetDiff;
				} else {
					selection.start.offset += offsetDiff;
				}
			} else if (selection.start.line > line) {
				selection.start.line += lineDiff;
			}

			if (selection.end.line === line && selection.end.offset >= offset) {
				if (lineDiff > 0) {
					selection.end.line += lineDiff;
					selection.end.offset = selection.end.offset - offset + offsetDiff;
				} else {
					selection.end.offset += offsetDiff;
				}
			} else if (selection.end.line > line) {
				selection.end.line += lineDiff;
			}
		}
		this._emitSelectionChangedEvent();
	}

	private _updateLinesTokens(firstLine: number, linesCount: number): void {
		if (this._tokenizeAfterEdit) {
			this._tokenizer.updateLinesTokens(firstLine, linesCount);
		}
	}

	private _emitEditEvent(): void {
		if (this._shouldEmitEditEvent) {
			this.emit(EvDocument.Edited, undefined);
		}
	}

	private _emitLinesCountChanged(lineDiff: number): void {
		if (this._shouldEmitLinesCountChangeEvent && lineDiff !== 0) {
			this.emit(EvDocument.LinesCount, {
				linesCount: this._document?.linesCount ?? 0,
			});
		}
	}

	private _emitSelectionChangedEvent(): void {
		this.emit(EvSelection.Changed, undefined);
	}
}

export default Editor;
