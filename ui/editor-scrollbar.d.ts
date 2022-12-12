import { Editor } from '../editor';
import { EventEmitter } from '../events';
import EdiotrView from './editor-view';
import { ScrollBarEvents } from './events';
export default class ScrollBar extends EventEmitter<ScrollBarEvents> {
    private _editor;
    private _view;
    private _mountPoint;
    private _emitterName;
    private _scrollBarContainer;
    private _scrollableDiv;
    private _firstVisibleLine;
    private _visibleLinesCount;
    private _totalLinesCount;
    private _maxLinesPadding;
    private _scale;
    constructor(editor: Editor, view: EdiotrView);
    update(): void;
    setTotalLinesCount(linesCount: number): void;
    setFirstVisibleLine(firstLine: number): void;
    setVisibleLinesCount(linesCount: number): void;
    setMaxLinesPadding(linesCount: number): void;
    private _createScrollContainer;
    private _updateScrollPosition;
    private _initEventListeners;
    private _onScroll;
    private _updateScale;
}
