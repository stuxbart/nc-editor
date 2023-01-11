import { Document } from '../document';
import DocumentReader from '../document-reader/document-reader';
import Reader from '../document-reader/reader';
import WrapReader from '../document-reader/wrap-reader';
import DocumentSession from '../document-session/document-session';
import DocumentWriter from '../document-writer/document-writer';
import { EventEmitter } from '../events';
import { HighlighterSchema } from '../highlighter';
import { getMode } from '../modes';
import { NaiveSearch, RegExpSearch, Search, SerachResults } from '../search';
import SearchResult from '../search/search-result';
import { Point, Selection } from '../selection';
import SelectionHistory from '../selection/selection-history';
import SelectionManager from '../selection/selection-manager';
import { EvWrap } from '../ui/events';
import { randomId } from '../utils';
import WrapData from '../wrapper/wrap-data';
import Wrapper from '../wrapper/wrapper';
import { EditSessionEvents, EvSearch, EvSelection } from './events';

export default class EditSession extends EventEmitter<EditSessionEvents> {
	private _id: string;
	private _documentSession: DocumentSession;
	private _highlightingSchema: HighlighterSchema;
	private _searchResults: SerachResults;
	private _selectionManager: SelectionManager;
	private _selectionHistory: SelectionHistory;
	private _reader: Reader;
	private _writer: DocumentWriter;
	private _wrapper: Wrapper;
	private _wrapData: WrapData;
	private _search: Search;
	private _useRegExp: boolean = false;

	private _searchAfterEdit: boolean = false;
	private _shouldUpdateSelections: boolean = true;

	private _useWrapData: boolean = false;
	private _visibleColumnsCount: number = 150;
	public letterWidth: number = 0;

	constructor(documentSession: DocumentSession) {
		super();
		this._id = randomId(10);
		this._documentSession = documentSession;
		this._highlightingSchema = getMode(documentSession.modeName).schema;

		this._selectionManager = new SelectionManager(this);
		this._selectionHistory = new SelectionHistory(this);
		this._searchResults = new SerachResults();
		this._reader = new DocumentReader(this._documentSession, this);
		this._writer = new DocumentWriter(this._documentSession, this);
		this._wrapper = new Wrapper(this);
		this._wrapData = new WrapData();
		this._search = new NaiveSearch();
	}

	public get id(): string {
		return this._id;
	}

	public get reader(): Reader {
		return this._reader;
	}

	public get writer(): DocumentWriter {
		return this._writer;
	}

	public get selections(): SelectionManager {
		return this._selectionManager;
	}

	public get history(): SelectionHistory {
		return this._selectionHistory;
	}

	public get searchResults(): SerachResults {
		return this._searchResults;
	}

	public get documentSession(): DocumentSession {
		return this._documentSession;
	}

	public get highlightingSchema(): HighlighterSchema {
		return this._highlightingSchema;
	}

	public get wrapper(): Wrapper {
		return this._wrapper;
	}

	public get wrapData(): WrapData {
		return this._wrapData;
	}

	public get isWrapEnabled(): boolean {
		return this._useWrapData;
	}

	public get visibleColumnsCount(): number {
		return this._visibleColumnsCount;
	}

	private get _document(): Document {
		return this._documentSession.document;
	}

	public get caseSensitiveSearch(): boolean {
		return this._searchResults.caseSensitive;
	}

	public get selectionSearch(): boolean {
		return this._searchResults.searchInSelection;
	}

	public get regexpSearch(): boolean {
		return this._useRegExp;
	}

	public enableSearchAfterEdit(): void {
		this._searchAfterEdit = true;
	}

	public disableSearchAfterEdit(): void {
		this._searchAfterEdit = false;
	}

	public updateLineSearchResults(firstLine: number): void {
		if (!this._searchAfterEdit) {
			return;
		}
		this._search.updateLineSearchResults(this._document, this._searchResults, firstLine);
		this.emit(EvSearch.Finished, undefined);
	}

	public updateLinesSearchResults(firstLine: number, linesCount: number): void {
		if (!this._searchAfterEdit) {
			return;
		}
		this._search.updateLinesSearchResults(
			this._document,
			this._searchResults,
			firstLine,
			linesCount,
		);
		this.emit(EvSearch.Finished, undefined);
	}

	public updateNewLinesSearchResults(firstLine: number, linesCount: number): void {
		if (!this._searchAfterEdit) {
			return;
		}
		this._search.updateNewLinesSearchResults(
			this._document,
			this._searchResults,
			firstLine,
			linesCount,
		);
		this.emit(EvSearch.Finished, undefined);
	}

	public updateRemovedLinesSearchResults(firstLine: number, linesCount: number): void {
		if (!this._searchAfterEdit) {
			return;
		}
		this._search.updateRemovedLinesSearchResults(
			this._document,
			this._searchResults,
			firstLine,
			linesCount,
		);
		this.emit(EvSearch.Finished, undefined);
	}

	public findNextOccurnece(startLine: number, startOffset: number): SearchResult | null {
		return this._search.findNextOccurence(
			this._document,
			this._searchResults,
			startLine,
			startOffset,
		);
	}

	public updateSelctions(
		line: number,
		offset: number,
		lineDiff: number,
		offsetDiff: number,
		emitEvent: boolean = true,
	): void {
		this._selectionManager.update(line, offset, lineDiff, offsetDiff);
		if (emitEvent) {
			this._emitSelectionChangedEvent();
		}
	}

	public search(phrase: string): void {
		const document = this._document;
		if (this._searchResults.searchInSelection) {
			this._search.searchInLines(
				phrase,
				document,
				this.searchResults,
				this._selectionManager.getActiveLinesNumbers(),
			);
		} else {
			this._search.search(phrase, document, this.searchResults);
		}
		this.emit(EvSearch.Finished, undefined);
	}

	public getSelctions(): Selection[] {
		return this._selectionManager.getSelections();
	}

	public setSelection(selection: Selection): void {
		this._selectionManager.setSelection(selection);
		this._emitSelectionChangedEvent();
	}

	public addSelection(selection: Selection): void {
		this._selectionManager.addSelection(selection);
		this._emitSelectionChangedEvent();
	}

	public extendLastSelection(point: Point): void {
		this._selectionManager.extendLastSelection(point);
		this._emitSelectionChangedEvent();
	}

	public selectAll(): void {
		this._selectionManager.selectAll();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToLeft(): void {
		this._selectionManager.collapseSelectionToLeft();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToRight(): void {
		this._selectionManager.collapseSelectionToRight();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToTop(): void {
		this._selectionManager.collapseSelectionToTop();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToBottom(): void {
		this._selectionManager.collapseSelectionToBottom();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToHome(): void {
		this._selectionManager.collapseSelectionToHome();
		this._emitSelectionChangedEvent();
	}

	public collapseSelectionToEnd(): void {
		this._selectionManager.collapseSelectionToEnd();
		this._emitSelectionChangedEvent();
	}

	public selectWordBefore(): void {
		this._selectionManager.selectWordBefore();
		this._emitSelectionChangedEvent();
	}

	public selectWordAfter(): void {
		this._selectionManager.selectWordAfter();
		this._emitSelectionChangedEvent();
	}

	public selectWordAt(point: Point, addSelection: boolean): void {
		this._selectionManager.selectWordAt(point, addSelection);
		this._emitSelectionChangedEvent();
	}

	public selectStartOfTheLine(): void {
		this._selectionManager.selectStartOfTheLine();
		this._emitSelectionChangedEvent();
	}

	public selectEndOfTheLine(): void {
		this._selectionManager.selectEndOfTheLine();
		this._emitSelectionChangedEvent();
	}

	public moveSelectionWordBefore(): void {
		this._selectionManager.moveSelectionWordBefore();
		this._emitSelectionChangedEvent();
	}

	public moveSelectionWordAfter(): void {
		this._selectionManager.moveSelectionWordAfter();
		this._emitSelectionChangedEvent();
	}

	public onlyLastSelection(): void {
		this._selectionManager.onlyLastSelection();
		this._emitSelectionChangedEvent();
	}

	public selectLine(lineNumber: number): void {
		this._selectionManager.selectLine(lineNumber);
		this._emitSelectionChangedEvent();
	}

	public emitSelectionChangedEvent(): void {
		this._emitSelectionChangedEvent();
	}

	public enableSelectionsUpdates(): void {
		this._selectionManager.enableUpdatingSelections();
		this._shouldUpdateSelections = true;
	}

	public disableSelectionsUpdates(): void {
		this._selectionManager.disableUpdatingSelections();
		this._shouldUpdateSelections = false;
	}

	public getActiveLinesNumbers(
		firstLine: number = 0,
		linesCount: number = Infinity,
	): Set<number> {
		return this._selectionManager.getActiveLinesNumbers(firstLine, linesCount);
	}

	public getActiveRowsNumbers(firstRow: number = 0, rowCount: number = Infinity): Set<number> {
		if (!this._useWrapData) {
			const cursors = this._selectionManager
				.getCursorsPositions()
				.filter(({ line }) => firstRow <= line && line <= firstRow + rowCount);

			const activeRows = new Set<number>();
			for (const cursor of cursors) {
				activeRows.add(cursor.line);
			}
			return activeRows;
		}

		const rows = this._reader.getRows(firstRow, rowCount);
		if (rows.length === 0) {
			return new Set<number>();
		}
		const firstLine = rows[0].line;
		const lastLine = rows[rows.length - 1].line;
		const cursors = this._selectionManager
			.getCursorsPositions()
			.filter(({ line }) => firstLine <= line && line <= lastLine);

		const activeRows = new Set<number>();

		for (const cursor of cursors) {
			for (let i = rows.length - 1; i > -1; i--) {
				const row = rows[i];
				if (cursor.line !== row.line) {
					continue;
				}
				if (row.offset <= cursor.offset && cursor.offset <= row.offset + row.text.length) {
					activeRows.add(firstRow + i);
					break;
				}
			}
		}
		return activeRows;
	}

	public getSelectedLinesCount(): number {
		return this._selectionManager.getSelectedLinesCount();
	}

	public extendRectangleSelection(point: Point): void {
		this._selectionManager.extendRectangleSelection(point);
		this._emitSelectionChangedEvent();
	}

	public getSearchPhrase(): string {
		return this._searchResults.phrase;
	}

	public getSearchMatchCount(): number {
		return this._searchResults.matchCount;
	}

	private _emitSelectionChangedEvent(): void {
		this.emit(EvSelection.Changed, undefined);
	}

	public undo(): void {
		this._documentSession.undo();
		this._wrapper.wrap();
		this._selectionHistory.undo();
		this._documentSession.emitEditEvent();
		this.emitSelectionChangedEvent();
	}

	public redo(): void {
		this._documentSession.redo();
		this._wrapper.wrap();
		this._selectionHistory.redo();
		this._documentSession.emitEditEvent();
		this.emitSelectionChangedEvent();
	}

	public enableWrap(): void {
		this._useWrapData = true;
		this._reader = new WrapReader(this.documentSession, this);
		if (!this._wrap()) {
			this.emit(EvWrap.Changed, { enabled: true });
		}
	}

	public disableWrap(): void {
		this._useWrapData = false;
		this._reader = new DocumentReader(this.documentSession, this);
		this.emit(EvWrap.Changed, { enabled: false });
	}

	public setVisibleColumnsCount(count: number): void {
		this._visibleColumnsCount = count;
		this._wrap();
	}

	private _wrap(): boolean {
		if (this._useWrapData) {
			if (this._wrapData.maxRowLength !== this._visibleColumnsCount) {
				this._wrapData.maxRowLength = this._visibleColumnsCount;
				this._wrapper.wrap();
				this.emit(EvWrap.Changed, { enabled: true });
				return true;
			}
		}
		return false;
	}

	public nextSearchResult(): void {
		this._searchResults.nextResult();
		this.emit(EvSearch.Finished, undefined);
	}

	public prevSearchResult(): void {
		this._searchResults.prevResult();
		this.emit(EvSearch.Finished, undefined);
	}

	public setCaseSensitiveSearch(enabled: boolean): void {
		if (enabled) {
			this.enableCaseSensitiveSearch();
		} else {
			this.disableCaseSensitiveSearch();
		}
	}

	public enableCaseSensitiveSearch(): boolean {
		this._searchResults.caseSensitive = true;
		this.search(this._searchResults.phrase);
		return this._searchResults.caseSensitive;
	}

	public disableCaseSensitiveSearch(): boolean {
		this._searchResults.caseSensitive = false;
		this.search(this._searchResults.phrase);
		return this._searchResults.caseSensitive;
	}

	public toggleCaseSensitiveSearch(): boolean {
		this._searchResults.caseSensitive = !this._searchResults.caseSensitive;
		this.search(this._searchResults.phrase);
		return this._searchResults.caseSensitive;
	}

	public setSelectionSearch(enabled: boolean): void {
		if (enabled) {
			this.enableSelectionSearch();
		} else {
			this.disableSelectionSearch();
		}
	}

	public enableSelectionSearch(): boolean {
		this._searchResults.searchInSelection = true;
		this.search(this._searchResults.phrase);
		return this._searchResults.caseSensitive;
	}

	public disableSelectionSearch(): boolean {
		this._searchResults.searchInSelection = false;
		this.search(this._searchResults.phrase);
		return this._searchResults.caseSensitive;
	}

	public toggleSelectionSearch(): boolean {
		this._searchResults.searchInSelection = !this._searchResults.searchInSelection;
		this.search(this._searchResults.phrase);
		return this._searchResults.searchInSelection;
	}

	public setRegExpSearch(enabled: boolean): void {
		if (enabled) {
			this.enableRegExpSearch();
		} else {
			this.disableRegExpSearch();
		}
	}

	public enableRegExpSearch(): boolean {
		this._useRegExp = true;
		this._search = new RegExpSearch();
		this.search(this._searchResults.phrase);
		return this._searchResults.caseSensitive;
	}

	public disableRegExpSearch(): boolean {
		this._useRegExp = false;
		this._search = new NaiveSearch();
		this.search(this._searchResults.phrase);
		return this._searchResults.caseSensitive;
	}

	public toggleRegExpSearch(): boolean {
		this._useRegExp = !this._useRegExp;
		if (this._useRegExp) {
			this._search = new RegExpSearch();
		} else {
			this._search = new NaiveSearch();
		}
		this.search(this._searchResults.phrase);
		return this._useRegExp;
	}
}
