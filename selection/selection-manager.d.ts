import { Document } from '../document';
import Point from './point';
import Selection from './selection';
export default class SelectionManager {
    private _selections;
    private _document;
    private _shouldUpdateSelections;
    private _rectSelectionStart;
    constructor(document?: Document | null);
    get length(): number;
    getSelections(): Selection[];
    getCursorsPositions(): Point[];
    enableUpdatingSelections(): void;
    disableUpdatingSelections(): void;
    update(line: number, offset: number, lineDiff: number, offsetDiff: number): void;
    clear(): void;
    setSelection(selection: Selection): void;
    setSelections(selection: Selection[]): void;
    addSelection(selection: Selection): void;
    extendLastSelection(point: Point): void;
    selectAll(): void;
    selectWordAt(point: Point, addSelection?: boolean): void;
    selectWordBefore(): void;
    selectWordAfter(): void;
    selectStartOfTheLine(): void;
    selectEndOfTheLine(): void;
    moveSelectionWordBefore(): void;
    moveSelectionWordAfter(): void;
    /**
     * point.offset for this function should be column in text
     */
    extendRectangleSelection(point: Point): void;
    collapseSelectionToLeft(): void;
    collapseSelectionToRight(): void;
    collapseSelectionToTop(): void;
    collapseSelectionToBottom(): void;
    collapseSelectionToHome(): void;
    collapseSelectionToEnd(): void;
    getActiveLinesNumbers(firstLine?: number, linesCount?: number): Set<number>;
    getSelectedLinesCount(): number;
    onlyLastSelection(): void;
    selectLine(lineNumber: number): void;
    private _removeOverlappingSelections;
    private _clearRectSelectionStart;
}
