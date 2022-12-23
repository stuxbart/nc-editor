import { EventEmitter } from '../events';
import EdiotrView from './editor-view';
import { TextLayerEvents } from './events';
declare class TextLayer extends EventEmitter<TextLayerEvents> {
    private _view;
    private _mountPoint;
    private _textContainer;
    private _firstVisibleLine;
    private _visibleLinesCount;
    private _visibleRows;
    private _activeLineNumber;
    private _hoveredLineNumber;
    private _lineHeight;
    private _letterWidth;
    private _rightPadding;
    private _resizeObserver;
    constructor(view: EdiotrView);
    private get _session();
    private get _highlighterSchema();
    private _initEventListeners;
    private _createTextContainer;
    setFirstVisibleLine(firstLine: number): void;
    setVisibleLinesCount(linesCount: number): void;
    update(): void;
    measureLetterWidth(): void;
    _updateActiveRows(): void;
    private _measureLetterWidth;
    private _renderRows;
    private _renderRow;
}
export default TextLayer;
