import { Line } from '../document';
import Document from '../document/document';
import { EventEmitter } from '../events';
import { HighlighterSchema } from '../highlighter';
import { MODES } from '../modes';
import { Point, Range, Selection } from '../selection';
import SelectionManager from '../selection/selection-manager';
import { getWordAfter, getWordBefore } from '../text-utils';
import { Tokenizer } from '../tokenizer';
import { EditorView } from '../ui';
import { EvView } from '../ui/events';
import { randomString } from '../utils';
import EditorSession from './editor-session';
import { EditorEvents, EvDocument, EvSelection, EvTokenizer } from './events';

/**
 * Editor class manages state of editor.
 */
class Editor extends EventEmitter<EditorEvents> {
	private _currentSessionId: string = '';
	private _sessions: Record<string, EditorSession> = {};
	private _hasActiveSession: boolean = false;

	private _tokenizeAfterEdit: boolean = true;

	private _shouldEmitEditEvent: boolean = true;
	private _shouldEmitLinesCountChangeEvent: boolean = true;
	private _shouldUpdateSelections: boolean = true;

	private _views: EditorView[] = [];

	constructor() {
		super();
		this._currentSessionId = 'default';
		const newDoc = new Document('');
		this._sessions[this._currentSessionId] = new EditorSession(newDoc);
	}

	private get _session(): EditorSession {
		const session = this._sessions[this._currentSessionId];
		if (session === undefined) {
			throw new Error("Session doesn't exist.");
		}
		return session;
	}

	private get _currentDocument(): Document {
		return this._session.document;
	}

	private get _selections(): SelectionManager {
		return this._session.selections;
	}

	private get _tokenizer(): Tokenizer {
		return this._session.mode.tokenizer;
	}

	public setMode(mode: string): void {
		if (mode in MODES) {
			this._session.mode = MODES[mode];
		} else {
			throw new Error("Mode with given name doesn't exist.");
		}
	}

	public getHighlighterSchema(): HighlighterSchema {
		return this._session.mode.schema;
	}

	public insert(str: string): void {
		const document = this._currentDocument;
		const selections = this._session.selections.getSelections();
		for (const sel of selections) {
			if (sel.isCollapsed) {
				continue;
			}
			const removedText = document.remove(sel);
			const removedLines = removedText.split('\n');
			this._updateLinesTokens(sel.start.line);
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
			const insertedLines = document.insert(str, line, offset);
			this._updateLinesTokens(line);
			this._updateSelctions(line, offset, insertedLines[0], insertedLines[1]);
		}
		this._emitLinesCountChanged(1);
		this._emitEditEvent();
	}

	public remove(type: number = 0): string {
		const document = this._currentDocument;
		const selections = this._session.selections.getSelections();
		let text: string = '';
		for (const sel of selections) {
			if (sel.isCollapsed) {
				if (sel.start.offset === 0 && type === 0) {
					if (sel.start.line !== 0) {
						sel.start.line -= 1;
						const line = document.getLine(sel.start.line);
						sel.start.offset = line.length + 1;
					} else {
						continue;
					}
				}
				if (type === 1) {
					const line = document.getLine(sel.start.line);
					if (
						sel.end.offset === line.length &&
						sel.end.line + 1 !== document.linesCount
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
			const removedText = document.remove(sel);
			const removedLines = removedText.split('\n');
			this._updateLinesTokens(sel.start.line);
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
		const document = this._currentDocument;
		for (const sel of this._selections.getSelections()) {
			if (!sel.isCollapsed) {
				continue;
			}
			const line = document.getLine(sel.start.line);
			const word = getWordBefore(line, sel.start.offset);
			sel.start.offset -= word.length;
		}
		return this.remove();
	}

	public removeWordAfter(): string {
		const document = this._currentDocument;
		for (const sel of this._selections.getSelections()) {
			if (!sel.isCollapsed) {
				continue;
			}
			const line = document.getLine(sel.start.line);
			const word = getWordAfter(line, sel.start.offset);
			sel.end.offset += word.length;
		}
		return this.remove();
	}

	public cut(): void {
		const removedText = this.remove();
		void navigator.clipboard.writeText(removedText);
	}

	public copy(): void {
		const document = this._currentDocument;
		const selections = this._selections.getSelections();
		let copiedText: string = '';
		for (const sel of selections) {
			if (sel.isCollapsed) {
				continue;
			}
			copiedText += document.getText(sel);
		}
		void navigator.clipboard.writeText(copiedText);
	}

	/**
	 * Returns the name of the new session.
	 */
	public addDocument(
		document: Document,
		name: string | null = null,
		mode: string = 'default',
	): string {
		if (name === null) {
			do {
				name = randomString();
			} while (name in this._sessions);
		}
		if (name in this._sessions) {
			throw new Error('A session for file with the given name already exists.');
		}
		const newSession = new EditorSession(document);
		this._sessions[name] = newSession;
		this._currentSessionId = name;
		this._hasActiveSession = true;

		this.setMode(mode);
		if (this._tokenizeAfterEdit) {
			this.tokenize();
		}
		this.emit(EvDocument.Set, undefined);
		this._emitLinesCountChanged(Infinity);
		return this._currentSessionId;
	}

	public changeSession(id: string): string {
		if (id in this._sessions) {
			this._currentSessionId = id;
			this._hasActiveSession = true;
		} else {
			throw new Error("Session with given id doesn't exist.");
		}
		this.emit(EvDocument.Set, undefined);
		this._emitLinesCountChanged(Infinity);
		this._emitEditEvent();
		this._emitSelectionChangedEvent();
		return this._currentSessionId;
	}

	public deleteSession(id: string): string {
		if (!(id in this._sessions)) {
			throw new Error("Session with given id doesn't exist.");
		}
		const newSessions: Record<string, EditorSession> = {};
		Object.keys(this._sessions).forEach((sessionName: string) => {
			if (sessionName !== id) {
				newSessions[sessionName] = this._sessions[sessionName];
			}
		});
		this._sessions = newSessions;

		if (id !== this._currentSessionId) {
			return this._currentSessionId;
		}

		const sessionsCount = Object.keys(newSessions).length;
		if (sessionsCount === 0) {
			this._hasActiveSession = false;
			this._currentSessionId = '';
		} else {
			this._currentSessionId = Object.keys(newSessions)[0];
		}
		return this._currentSessionId;
	}

	public get hasActiveSession(): boolean {
		return this._hasActiveSession;
	}

	public getText(): string {
		return this._currentDocument.getText();
	}

	public getTotalLinesCount(): number {
		return this._currentDocument.linesCount;
	}

	/**
	 * Combines text data with tokenization result.
	 * @param firstLine number of first line
	 * @param count count of lines to read
	 * @returns list of lines with tokenization data
	 */
	public getLines(firstLine: number, count: number): Line[] {
		const document = this._currentDocument;
		const tokenizerData = this._session.tokenizerData;
		const rawLines = document.getLineNodes(firstLine, count);
		const lines: Line[] = [];
		for (const line of rawLines) {
			lines.push({
				rawText: line.text,
				tokens: tokenizerData.getLineTokens(line),
				lineBreaks: [],
			});
		}
		return lines;
	}

	public getFirstLine(): Line | null {
		const document = this._currentDocument;
		const tokenizerData = this._session.tokenizerData;
		const firstLine = document.getFirstLineNode();
		if (firstLine === null) {
			return null;
		}
		const line = new Line(firstLine.text, tokenizerData.getLineTokens(firstLine), []);
		return line;
	}

	public getLastLine(): Line | null {
		const document = this._currentDocument;
		const tokenizerData = this._session.tokenizerData;
		const lastLine = document.getLastLineNode();
		if (lastLine === null) {
			return null;
		}

		const line = new Line(lastLine.text, tokenizerData.getLineTokens(lastLine), []);
		return line;
	}

	public tokenize(): void {
		const document = this._currentDocument;
		this._tokenizer.tokenize(document, this._session.tokenizerData);
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

	public collapseSelectionToHome(): void {
		this._selections.collapseSelectionToHome();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToEnd(): void {
		this._selections.collapseSelectionToEnd();
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

	public selectStartOfTheLine(): void {
		this._selections.selectStartOfTheLine();
		this._emitSelectionChangedEvent();
	}

	public selectEndOfTheLine(): void {
		this._selections.selectEndOfTheLine();
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
		if (this._selections.length !== 1) {
			return;
		}
		const document = this._currentDocument;
		const sel = this._selections.getSelections()[0];
		if (sel.start.line === 0) {
			return;
		}
		let line = sel.start.line;
		while (line < sel.end.line + 1) {
			document.swapLineWithPrevious(line);
			line++;
		}

		this._updateLinesTokens(sel.start.line - 1);
		sel.start.line -= 1;
		sel.end.line -= 1;
		this._emitSelectionChangedEvent();
		this._emitEditEvent();
	}

	public swapLinesDown(): void {
		if (this._selections.length !== 1) {
			return;
		}
		const document = this._currentDocument;
		const sel = this._selections.getSelections()[0];
		if (sel.end.line === document.linesCount - 1) {
			return;
		}

		let line = sel.end.line;
		while (line > sel.start.line - 1) {
			document.swapLineWithNext(line);
			line--;
		}

		this._updateLinesTokens(sel.start.line);
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

	public getActiveLinesNumbers(
		firstLine: number = 0,
		linesCount: number = Infinity,
	): Set<number> {
		return this._selections.getActiveLinesNumbers(firstLine, linesCount);
	}

	public getSelectedLinesCount(): number {
		return this._selections.getSelectedLinesCount();
	}

	public indentSelectedLines(indentString: string = '\t'): void {
		const document = this._currentDocument;
		const selectedLines = this._selections.getActiveLinesNumbers();
		if (selectedLines.size < 2) {
			return;
		}
		for (const lineNumber of selectedLines) {
			document.insert(indentString, lineNumber, 0);
			this._updateLinesTokens(lineNumber);
			this._updateSelctions(lineNumber, 0, 0, 1);
		}

		this._emitEditEvent();
	}

	public removeIndentFromSelectedLines(indentString: string = '\t'): void {
		const document = this._currentDocument;
		const selectedLines = this._selections.getActiveLinesNumbers();

		for (const lineNumber of selectedLines) {
			const line = document.getLine(lineNumber);
			if (!line.startsWith(indentString)) {
				continue;
			}
			document.remove(new Range(lineNumber, 0, lineNumber, indentString.length));
			this._updateLinesTokens(lineNumber);
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

	private _updateLinesTokens(firstLine: number): void {
		if (this._tokenizeAfterEdit) {
			const document = this._currentDocument;
			const tokenizerData = this._session.tokenizerData;
			this._tokenizer.updateTokens(document, tokenizerData, firstLine);
		}
	}

	private _emitEditEvent(): void {
		if (this._shouldEmitEditEvent) {
			this.emit(EvDocument.Edited, undefined);
		}
	}

	private _emitLinesCountChanged(lineDiff: number): void {
		if (this._shouldEmitLinesCountChangeEvent && lineDiff !== 0) {
			const document = this._currentDocument;
			this.emit(EvDocument.LinesCount, {
				linesCount: document.linesCount,
			});
		}
	}

	private _emitSelectionChangedEvent(): void {
		this.emit(EvSelection.Changed, undefined);
	}

	private _emitInitEvents(): void {
		const document = this._currentDocument;
		this.emit(EvSelection.Changed, undefined);
		this.emit(EvDocument.Set, undefined);
		this.emit(EvDocument.LinesCount, {
			linesCount: document.linesCount,
		});
		this.emit(EvTokenizer.Finished, undefined);
	}
}

export default Editor;
