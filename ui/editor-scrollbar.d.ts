import { EventEmitter } from '../events';
import EdiotrView from './editor-view';
import { ScrollBarEvents } from './events';
export default class ScrollBar extends EventEmitter<ScrollBarEvents> {
    private _view;
    private _mountPoint;
    private _emitterName;
    private _scrollBarContainer;
    private _scrollableDiv;
    private _firstVisibleRow;
    private _visibleRowsCount;
    private _totalRowsCount;
    private _maxRowsPadding;
    private _scale;
    constructor(view: EdiotrView);
    private get _session();
    update(): void;
    setTotalRowsCount(rowsCount: number): void;
    setFirstVisibleRow(firstRow: number): void;
    setVisibleRowsCount(rowsCount: number): void;
    setMaxRowsPadding(rowsCount: number): void;
    private _createScrollContainer;
    private _updateScrollPosition;
    private _initEventListeners;
    private _onScroll;
    private _onMouseDown;
    private _onMouseUp;
    private _updateScale;
}
