import { Editor } from '../editor';
import EdiotrView from './editor-view';
export default class SelectionLayer {
    private _editor;
    private _view;
    private _mountPoint;
    private _selectionContainer;
    private _firstVisibleLine;
    private _visibleLinesCount;
    private _lineHeight;
    private _letterWidth;
    private _visibleSelections;
    private _isMouseHold;
    private _isCtrlHold;
    private _isShitHold;
    private _isAltHold;
    constructor(editor: Editor, view: EdiotrView);
    setFirstVisibleLine(firstLine: number): void;
    setVisibleLinesCount(linesCount: number): void;
    update(): void;
    private _crateSelctionContainer;
    private _initEventListeners;
    private _renderSelections;
    private _renderCursors;
    private _onMouseDown;
    private _onMouseUp;
    private _onMouseMove;
    private _onDoubleClick;
}
