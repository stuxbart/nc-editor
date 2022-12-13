import { Line } from '../document';
import Document from '../document/document';
import { EventEmitter } from '../events';
import { HighlighterSchema } from '../highlighter';
import { Point, Selection } from '../selection';
import { EditorView } from '../ui';
import { EditorEvents } from './events';
/**
 * Editor class manages state of editor.
 */
declare class Editor extends EventEmitter<EditorEvents> {
    private _currentSessionId;
    private _sessions;
    private _hasActiveSession;
    private _tokenizeAfterEdit;
    private _searchAfterEdit;
    private _shouldEmitEditEvent;
    private _shouldEmitLinesCountChangeEvent;
    private _shouldUpdateSelections;
    private _views;
    constructor();
    private get _session();
    private get _currentDocument();
    private get _selections();
    private get _tokenizer();
    private get _search();
    setMode(mode: string): void;
    getHighlighterSchema(): HighlighterSchema;
    insert(str: string): void;
    remove(type?: number): string;
    removeWordBefore(): string;
    removeWordAfter(): string;
    cut(): void;
    copy(): void;
    /**
     * Returns the name of the new session.
     */
    addDocument(document: Document, name?: string | null, mode?: string): string;
    changeSession(id: string): string;
    deleteSession(id: string): string;
    get hasActiveSession(): boolean;
    getText(): string;
    getTotalLinesCount(): number;
    /**
     * Combines text data with tokenization result.
     * @param firstLine number of first line
     * @param count count of lines to read
     * @returns list of lines with tokenization data
     */
    getLines(firstLine: number, count: number): Line[];
    getFirstLine(): Line | null;
    getLastLine(): Line | null;
    tokenize(): void;
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
    swapLinesUp(): void;
    swapLinesDown(): void;
    addView(view: EditorView): void;
    enableTokenization(): void;
    disableTokenization(): void;
    enableEditEvent(): void;
    disableEditEvent(): void;
    enableLinesChangedEvent(): void;
    disableLinesChangedEvent(): void;
    enableSelectionsUpdates(): void;
    disableSelectionsUpdates(): void;
    getActiveLinesNumbers(firstLine?: number, linesCount?: number): Set<number>;
    getSelectedLinesCount(): number;
    indentSelectedLines(indentString?: string): void;
    removeIndentFromSelectedLines(indentString?: string): void;
    extendRectangleSelection(point: Point): void;
    getSearchPhrase(): string;
    getSearchMatchCount(): number;
    private _updateSelctions;
    private _updateLinesTokens;
    private _updateLinesSearchResults;
    private _emitEditEvent;
    private _emitLinesCountChanged;
    private _emitSelectionChangedEvent;
    private _emitInitEvents;
}
export default Editor;
