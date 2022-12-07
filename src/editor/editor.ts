import { Line } from '../document';
import Document from '../document/document';
import { EventEmitter } from '../events';
import { Point, Selection } from '../selection';
import { pointCompare } from '../selection/utils';
import { Tokenizer } from '../tokenizer';
import { EditorView } from '../ui';
import { EvView } from '../ui/events';
import { EditorEvents, EvDocument, EvSelection, EvTokenizer } from './events';

/**
 * Editor class manages state of editor.
 */
class Editor extends EventEmitter<EditorEvents> {
	private _selections: Selection[] = [];
	private _document: Document | null = null;
	private _tokenizeAfterEdit: boolean = true;
	private _tokenizer: Tokenizer;

	private _shouldEmitEditEvent: boolean = true;
	private _shouldEmitLinesCountChangeEvent: boolean = true;

	private _views: EditorView[] = [];

	constructor() {
		super();
		const newDoc = new Document('');
		this._document = newDoc;
		this._selections = [new Selection(0, 0, 0, 0)];
		this._tokenizer = new Tokenizer(this._document, false);
	}

	public insert(str: string): void {
		if (this._document === null) {
			return;
		}
		for (const sel of this._selections) {
			if (sel.isCollapsed) {
				continue;
			}
			const removedText = this._document.remove(sel);
			const removedLines = removedText.split('\n');
			this._updateLinesTokens(sel.start.line, 2);
			this._emitLinesCountChanged(sel.end.line - sel.start.line);
			this._updateSelctions(
				sel.start.line,
				sel.start.offset,
				-removedLines.length + 1,
				-(sel.end.offset - sel.start.offset),
			);
		}

		for (const sel of this._selections) {
			const line = sel.start.line;
			const offset = sel.start.offset;
			const insertedLines = this._document.insert(str, line, offset);
			this._updateLinesTokens(line, insertedLines[0] + 1);
			this._updateSelctions(line, offset, insertedLines[0], insertedLines[1]);
		}
		this._emitLinesCountChanged(1);
		this._emitEditEvent();
	}

	public remove(type: number = 0): void {
		if (this._document === null) {
			return;
		}
		for (const sel of this._selections) {
			if (sel.isCollapsed) {
				if (sel.start.offset === 0) {
					continue;
				}
				if (type === 1) {
					sel.end.offset = sel.end.offset + 1;
				} else {
					sel.start.offset = sel.start.offset - 1;
				}
			}
			const removedText = this._document.remove(sel);
			const removedLines = removedText.split('\n');
			this._updateLinesTokens(sel.start.line, 2);
			this._emitLinesCountChanged(sel.end.line - sel.start.line);
			this._updateSelctions(
				sel.start.line,
				sel.start.offset,
				-removedLines.length + 1,
				-(sel.end.offset - sel.start.offset),
			);
		}
		this._emitEditEvent();
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

	public getFirstLine(): Line | null {
		if (this._document === null) {
			return null;
		}
		const firstLine = this._document.getFirstLineNode();
		if (firstLine === null) {
			return null;
		}
		const line = new Line(firstLine.text, this._tokenizer.getTokensForLine(firstLine), []);
		return line;
	}

	public getLastLine(): Line | null {
		if (this._document === null) {
			return null;
		}
		const lastLine = this._document.getLastLineNode();
		if (lastLine === null) {
			return null;
		}

		const line = new Line(lastLine.text, this._tokenizer.getTokensForLine(lastLine), []);
		return line;
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

	public extendLastSelection(point: Point): void {
		if (this._selections.length === 0) {
			return;
		}
		const lastSelection = this._selections[this._selections.length - 1];
		lastSelection.updateSelection(point);
		this._emitSelectionChangedEvent();
	}

	public addView(view: EditorView): void {
		this._views.push(view);
		view.on(EvView.Initialized, () => {
			this._emitInitEvents();
		});
	}

	private _updateSelctions(
		line: number,
		offset: number,
		lineDiff: number,
		offsetDiff: number,
	): void {
		let op = 0;
		if (lineDiff < 0) {
			op = 0;
		} else {
			if (offsetDiff < 0) {
				op = 0;
			} else {
				op = 1;
			}
		}
		const start = new Point(line, offset);
		const end = new Point(line - lineDiff, offset - offsetDiff);

		for (const selection of this._selections) {
			for (const point of [selection.start, selection.end]) {
				if (op) {
					if (pointCompare(point, start) !== 2) {
						if (point.line === line) {
							if (lineDiff) {
								point.offset = point.offset - start.offset + offsetDiff;
							} else {
								point.offset += offsetDiff;
							}
						}
						point.line += lineDiff;
					}
				} else {
					if (
						point.line >= start.line &&
						point.line <= end.line &&
						point.offset >= end.offset - 1
					) {
						if (pointCompare(point, end) !== 1) {
							point.offset = start.offset;
							point.line = start.line;
						} else {
							point.line = start.line;
							point.offset = start.offset + point.offset - end.offset;
						}
					}
				}
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

	private _emitInitEvents(): void {
		this.emit(EvSelection.Changed, undefined);
		this.emit(EvDocument.Set, undefined);
		this.emit(EvDocument.LinesCount, {
			linesCount: this._document?.linesCount ?? 0,
		});
		this.emit(EvTokenizer.Finished, undefined);
	}
}

export default Editor;
