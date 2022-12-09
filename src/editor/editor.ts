import { Line } from '../document';
import Document from '../document/document';
import { EventEmitter } from '../events';
import { Point, Range, Selection } from '../selection';
import SelectionManager from '../selection/selection-manager';
import { getWordAfter, getWordBefore } from '../text-utils';
import { Tokenizer } from '../tokenizer';
import { EditorView } from '../ui';
import { EvView } from '../ui/events';
import { EditorEvents, EvDocument, EvSelection, EvTokenizer } from './events';

/**
 * Editor class manages state of editor.
 */
class Editor extends EventEmitter<EditorEvents> {
	private _selections: SelectionManager;
	private _document: Document | null = null;
	private _tokenizeAfterEdit: boolean = true;
	private _tokenizer: Tokenizer;

	private _shouldEmitEditEvent: boolean = true;
	private _shouldEmitLinesCountChangeEvent: boolean = true;
	private _shouldUpdateSelections: boolean = true;

	private _views: EditorView[] = [];

	constructor() {
		super();
		const newDoc = new Document('');
		this._document = newDoc;
		this._selections = new SelectionManager(this._document);
		this._tokenizer = new Tokenizer(this._document, false);
	}

	public insert(str: string): void {
		if (this._document === null) {
			return;
		}
		const selections = this._selections.getSelections();
		for (const sel of selections) {
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

		for (const sel of selections) {
			const line = sel.start.line;
			const offset = sel.start.offset;
			const insertedLines = this._document.insert(str, line, offset);
			this._updateLinesTokens(line, insertedLines[0] + 1);
			this._updateSelctions(line, offset, insertedLines[0], insertedLines[1]);
		}
		this._emitLinesCountChanged(1);
		this._emitEditEvent();
	}

	public remove(type: number = 0): string {
		if (this._document === null) {
			return '';
		}
		const selections = this._selections.getSelections();
		let text: string = '';
		for (const sel of selections) {
			if (sel.isCollapsed) {
				if (sel.start.offset === 0 && type === 0) {
					if (sel.start.line !== 0) {
						sel.start.line -= 1;
						const line = this._document.getLine(sel.start.line);
						sel.start.offset = line.length + 1;
					} else {
						continue;
					}
				}
				if (type === 1) {
					const line = this._document.getLine(sel.start.line);
					if (
						sel.end.offset === line.length &&
						sel.end.line + 1 !== this._document.linesCount
					) {
						sel.end.offset = 0;
						sel.end.line += 1;
					} else {
						sel.end.offset = sel.end.offset + 1;
					}
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
			text += removedText;
		}
		this._emitEditEvent();
		return text;
	}

	public removeWordBefore(): string {
		if (this._selections.length !== 1 || this._document === null) {
			return '';
		}
		const sel = this._selections.getSelections()[0];
		if (!sel.isCollapsed) {
			return this.remove();
		}
		const line = this._document.getLine(sel.start.line);
		const word = getWordBefore(line, sel.start.offset);
		sel.start.offset -= word.length;
		return this.remove();
	}

	public removeWordAfter(): string {
		if (this._selections.length !== 1 || this._document === null) {
			return '';
		}
		const sel = this._selections.getSelections()[0];
		if (!sel.isCollapsed) {
			return this.remove();
		}
		const line = this._document.getLine(sel.start.line);
		const word = getWordAfter(line, sel.start.offset);
		sel.end.offset += word.length;
		return this.remove();
	}

	public cut(): void {
		if (!this._document) {
			return;
		}
		const removedText = this.remove();
		void navigator.clipboard.writeText(removedText);
	}

	public copy(): void {
		if (this._document === null) {
			return;
		}
		const selections = this._selections.getSelections();
		let copiedText: string = '';
		for (const sel of selections) {
			if (sel.isCollapsed) {
				continue;
			}
			copiedText += this._document.getText(sel);
		}
		void navigator.clipboard.writeText(copiedText);
	}

	public setDocument(document: Document): void {
		this._document = document;
		if (this._tokenizeAfterEdit) {
			this.tokenize();
		}
		this._selections = new SelectionManager(this._document);
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
		return this._selections.getSelections();
	}

	public setSelection(selection: Selection): void {
		this._selections.setSelection(selection);
		this._emitSelectionChangedEvent();
	}

	public addSelection(selection: Selection): void {
		this._selections.addSelection(selection);
		this._emitSelectionChangedEvent();
	}

	public extendLastSelection(point: Point): void {
		this._selections.extendLastSelection(point);
		this._emitSelectionChangedEvent();
	}

	public selectAll(): void {
		this._selections.selectAll();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToLeft(): void {
		this._selections.collapseSelectionToLeft();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToRight(): void {
		this._selections.collapseSelectionToRight();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToTop(): void {
		this._selections.collapseSelectionToTop();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToBottom(): void {
		this._selections.collapseSelectionToBottom();
		this._emitSelectionChangedEvent();
	}

	public selectWordBefore(): void {
		this._selections.selectWordBefore();
		this._emitSelectionChangedEvent();
	}

	public selectWordAfter(): void {
		this._selections.selectWordAfter();
		this._emitSelectionChangedEvent();
	}

	public selectWordAt(point: Point, addSelection: boolean): void {
		this._selections.selectWordAt(point, addSelection);
		this._emitSelectionChangedEvent();
	}

	public moveSelectionWordBefore(): void {
		this._selections.moveSelectionWordBefore();
		this._emitSelectionChangedEvent();
	}

	public moveSelectionWordAfter(): void {
		this._selections.moveSelectionWordAfter();
		this._emitSelectionChangedEvent();
	}

	public swapLinesUp(): void {
		if (this._document === null || this._selections.length !== 1) {
			return;
		}
		const sel = this._selections.getSelections()[0];
		if (sel.start.line === 0) {
			return;
		}
		let line = sel.start.line;
		while (line < sel.end.line + 1) {
			this._document.swapLineWithPrevious(line);
			line++;
		}

		this._updateLinesTokens(sel.start.line - 1, sel.end.line - sel.start.line + 2);
		sel.start.line -= 1;
		sel.end.line -= 1;
		this._emitSelectionChangedEvent();
		this._emitEditEvent();
	}

	public swapLinesDown(): void {
		if (this._document === null || this._selections.length !== 1) {
			return;
		}
		const sel = this._selections.getSelections()[0];
		if (sel.end.line === this._document.linesCount - 1) {
			return;
		}

		let line = sel.end.line;
		while (line > sel.start.line - 1) {
			this._document.swapLineWithNext(line);
			line--;
		}

		this._updateLinesTokens(sel.start.line - 1, sel.end.line - sel.start.line + 3);
		sel.start.line += 1;
		sel.end.line += 1;
		this._emitSelectionChangedEvent();
		this._emitEditEvent();
	}

	public addView(view: EditorView): void {
		this._views.push(view);
		view.on(EvView.Initialized, () => {
			this._emitInitEvents();
		});
	}

	public enableTokenization(): void {
		this._tokenizeAfterEdit = true;
	}

	public disableTokenization(): void {
		this._tokenizeAfterEdit = false;
	}

	public enableEditEvent(): void {
		this._shouldEmitEditEvent = true;
	}

	public disableEditEvent(): void {
		this._shouldEmitEditEvent = false;
	}

	public enableLinesChangedEvent(): void {
		this._shouldEmitLinesCountChangeEvent = true;
	}

	public disableLinesChangedEvent(): void {
		this._shouldEmitLinesCountChangeEvent = false;
	}

	public enableSelectionsUpdates(): void {
		this._selections.enableUpdatingSelections();
		this._shouldUpdateSelections = true;
	}

	public disableSelectionsUpdates(): void {
		this._selections.disableUpdatingSelections();
		this._shouldUpdateSelections = false;
	}

	public getActiveLinesNumbers(): Set<number> {
		return this._selections.getActiveLinesNumbers();
	}

	public getSelectedLinesCount(): number {
		return this._selections.getSelectedLinesCount();
	}

	public indentSelectedLines(indentString: string = '\t'): void {
		if (this._document === null) {
			return;
		}
		const selectedLines = this._selections.getActiveLinesNumbers();
		if (selectedLines.size < 2) {
			return;
		}
		for (const lineNumber of selectedLines) {
			this._document.insert(indentString, lineNumber, 0);
			this._updateLinesTokens(lineNumber, 2);
			this._updateSelctions(lineNumber, 0, 0, 1);
		}

		this._emitEditEvent();
	}

	public removeIndentFromSelectedLines(indentString: string = '\t'): void {
		if (this._document === null) {
			return;
		}
		const selectedLines = this._selections.getActiveLinesNumbers();

		for (const lineNumber of selectedLines) {
			const line = this._document.getLine(lineNumber);
			if (!line.startsWith(indentString)) {
				continue;
			}
			this._document.remove(new Range(lineNumber, 0, lineNumber, indentString.length));
			this._updateLinesTokens(lineNumber, 2);
			this._updateSelctions(lineNumber, 0, 0, 1);
		}

		this._emitEditEvent();
	}

	public extendRectangleSelection(point: Point): void {
		this._selections.extendRectangleSelection(point);
		this._emitSelectionChangedEvent();
	}

	private _updateSelctions(
		line: number,
		offset: number,
		lineDiff: number,
		offsetDiff: number,
	): void {
		this._selections.update(line, offset, lineDiff, offsetDiff);
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
