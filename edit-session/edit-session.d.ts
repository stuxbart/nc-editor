import Reader from '../document-reader/reader';
import DocumentSession from '../document-session/document-session';
import DocumentWriter from '../document-writer/document-writer';
import { EventEmitter } from '../events';
import { HighlighterSchema } from '../highlighter';
import { SerachResults } from '../search';
import SearchResult from '../search/search-result';
import { Point, Selection } from '../selection';
import SelectionHistory from '../selection/selection-history';
import SelectionManager from '../selection/selection-manager';
import WrapData from '../wrapper/wrap-data';
import Wrapper from '../wrapper/wrapper';
import { EditSessionEvents } from './events';
export default class EditSession extends EventEmitter<EditSessionEvents> {
    private _id;
    private _documentSession;
    private _highlightingSchema;
    private _searchResults;
    private _selectionManager;
    private _selectionHistory;
    private _reader;
    private _writer;
    private _wrapper;
    private _wrapData;
    private _search;
    private _useRegExp;
    private _searchAfterEdit;
    private _shouldUpdateSelections;
    private _useWrapData;
    private _visibleColumnsCount;
    letterWidth: number;
    constructor(documentSession: DocumentSession);
    get id(): string;
    get reader(): Reader;
    get writer(): DocumentWriter;
    get selections(): SelectionManager;
    get history(): SelectionHistory;
    get searchResults(): SerachResults;
    get documentSession(): DocumentSession;
    get highlightingSchema(): HighlighterSchema;
    get wrapper(): Wrapper;
    get wrapData(): WrapData;
    get isWrapEnabled(): boolean;
    get visibleColumnsCount(): number;
    private get _document();
    get caseSensitiveSearch(): boolean;
    get selectionSearch(): boolean;
    get regexpSearch(): boolean;
    enableSearchAfterEdit(): void;
    disableSearchAfterEdit(): void;
    updateLineSearchResults(firstLine: number): void;
    updateLinesSearchResults(firstLine: number, linesCount: number): void;
    updateNewLinesSearchResults(firstLine: number, linesCount: number): void;
    updateRemovedLinesSearchResults(firstLine: number, linesCount: number): void;
    findNextOccurnece(startLine: number, startOffset: number): SearchResult | null;
    updateSelctions(line: number, offset: number, lineDiff: number, offsetDiff: number): void;
    search(phrase: string): void;
    getSelctions(): Selection[];
    setSelection(selection: Selection): void;
    addSelection(selection: Selection): void;
    extendLastSelection(point: Point): void;
    selectAll(): void;
    collapseSelectionToLeft(): void;
    collapseSelectionToRight(): void;
    collapseSelectionToTop(): void;
    collapseSelectionToBottom(): void;
    collapseSelectionToHome(): void;
    collapseSelectionToEnd(): void;
    selectWordBefore(): void;
    selectWordAfter(): void;
    selectWordAt(point: Point, addSelection: boolean): void;
    selectStartOfTheLine(): void;
    selectEndOfTheLine(): void;
    moveSelectionWordBefore(): void;
    moveSelectionWordAfter(): void;
    onlyLastSelection(): void;
    selectLine(lineNumber: number): void;
    emitSelectionChangedEvent(): void;
    enableSelectionsUpdates(): void;
    disableSelectionsUpdates(): void;
    getActiveLinesNumbers(firstLine?: number, linesCount?: number): Set<number>;
    getActiveRowsNumbers(firstRow?: number, rowCount?: number): Set<number>;
    getSelectedLinesCount(): number;
    extendRectangleSelection(point: Point): void;
    getSearchPhrase(): string;
    getSearchMatchCount(): number;
    private _emitSelectionChangedEvent;
    undo(): void;
    redo(): void;
    enableWrap(): void;
    disableWrap(): void;
    setVisibleColumnsCount(count: number): void;
    private _wrap;
    nextSearchResult(): void;
    prevSearchResult(): void;
    setCaseSensitiveSearch(enabled: boolean): void;
    enableCaseSensitiveSearch(): boolean;
    disableCaseSensitiveSearch(): boolean;
    toggleCaseSensitiveSearch(): boolean;
    setSelectionSearch(enabled: boolean): void;
    enableSelectionSearch(): boolean;
    disableSelectionSearch(): boolean;
    toggleSelectionSearch(): boolean;
    setRegExpSearch(enabled: boolean): void;
    enableRegExpSearch(): boolean;
    disableRegExpSearch(): boolean;
    toggleRegExpSearch(): boolean;
}
