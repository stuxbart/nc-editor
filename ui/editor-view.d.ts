import { Editor } from '../editor';
import { EventEmitter } from '../events';
import { Theme } from './themes';
import { EditorViewEvents } from './events';
export default class EditorView extends EventEmitter<EditorViewEvents> {
    private _editor;
    private _mountPoint;
    private _editorContainer;
    private _emitterName;
    private _textLayer;
    private _gutter;
    private _scrollBar;
    private _selectionLayer;
    private _input;
    private _firstVisibleLine;
    private _visibleLinesCount;
    private _scrollHeight;
    private _scrollWidth;
    private _scrollLeft;
    private _scrollbarWidth;
    private _gutterWidth;
    private _isFocused;
    private _height;
    private _width;
    private _lineHeight;
    private _fontSize;
    private _fontFamily;
    private _letterWidth;
    private _hoverLineNumber;
    private _activeLineNumber;
    private _isCtrlHold;
    private _isShitHold;
    private _isLeftAltHold;
    private _isRightAltHold;
    private _theme;
    constructor(editor: Editor, mountPoint: HTMLElement | string);
    mount(parent: HTMLElement | string): number;
    unmount(): void;
    setTheme(_theme: string | Theme): number;
    update(): void;
    getDOMElement(): HTMLElement | null;
    private _emitInitEvent;
    private _scrollBarInitialConfig;
    private _createEditorContainer;
    private _updateGridLayout;
    private _createInputElement;
    private _updateEditorSize;
    private _initEventListeners;
    private _onPaste;
    private _onResize;
    private _onMouseWheel;
    private _onMouseDown;
    private _onBlur;
    private _onKeyDown;
    private _onKeyUp;
    private _onDocumentClick;
    scrollToLine(lineNumber: number): void;
    private _setFocus;
    private _scrollToLine;
}
