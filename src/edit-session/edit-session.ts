import { Document } from '../document';
import DocumentReader from '../document-reader/document-reader';
import DocumentSession from '../document-session/document-session';
import DocumentWriter from '../document-writer/document-writer';
import { EventEmitter } from '../events';
import { HighlighterSchema } from '../highlighter';
import { getMode } from '../modes';
import { SerachResults } from '../search';
import { Point, Selection } from '../selection';
import SelectionManager from '../selection/selection-manager';
import { randomId } from '../utils';
import { EditSessionEvents, EvSearch, EvSelection } from './events';

export default class EditSession extends EventEmitter<EditSessionEvents> {
	private _id: string;
	private _documentSession: DocumentSession;
	private _highlightingSchema: HighlighterSchema;
	private _searchResults: SerachResults;
	private _selectionManager: SelectionManager;
	private _reader: DocumentReader;
	private _writer: DocumentWriter;

	private _searchAfterEdit: boolean = true;
	private _shouldUpdateSelections: boolean = true;

	constructor(documentSession: DocumentSession) {
		super();
		this._id = randomId(10);
		this._documentSession = documentSession;
		this._highlightingSchema = getMode(documentSession.modeName).schema;

		this._selectionManager = new SelectionManager();
		this._searchResults = new SerachResults();
		this._reader = new DocumentReader(this._documentSession, this);
		this._writer = new DocumentWriter(this._documentSession, this);
	}

	public get id(): string {
		return this._id;
	}

	public get reader(): DocumentReader {
		return this._reader;
	}

	public get writer(): DocumentWriter {
		return this._writer;
	}

	public get selections(): SelectionManager {
		return this._selectionManager;
	}

	public get searchResults(): SerachResults {
		return this._searchResults;
	}

	private get _document(): Document {
		return this._documentSession.document;
	}

	public updateLinesSearchResults(firstLine: number): void {
		if (this._searchAfterEdit) {
			this._documentSession.search.updateSearchResults(
				this._document,
				this._searchResults,
				firstLine,
			);
		}
	}

	public updateSelctions(
		line: number,
		offset: number,
		lineDiff: number,
		offsetDiff: number,
	): void {
		this._selectionManager.update(line, offset, lineDiff, offsetDiff);
		this._emitSelectionChangedEvent();
	}

	public search(phrase: string): void {
		const document = this._document;
		this._documentSession.search.search(phrase, document, this.searchResults);
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
}
