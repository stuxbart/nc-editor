import { Editor } from '../editor';
import { EventEmitter } from '../events';
import { Theme } from './themes';
import { EditorViewEvents } from './events';
import EditSession from '../edit-session/edit-session';
import DocumentReader from '../document-reader/document-reader';
import DocumentWriter from '../document-writer/document-writer';
export default class EditorView extends EventEmitter<EditorViewEvents> {
    private _editor;
    private _sessionId;
    private _session;
    private _docSession;
    private _mountPoint;
    private _editorContainer;
    private _emitterName;
    private _textLayer;
    private _gutter;
    private _scrollBar;
    private _selectionLayer;
    private _input;
    private _search;
    private _firstVisibleRow;
    private _visibleRowsCount;
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
    get session(): EditSession;
    get reader(): DocumentReader;
    get writer(): DocumentWriter;
    get visibleRowsCount(): number;
    mount(parent: HTMLElement | string): number;
    unmount(): void;
    setTheme(_theme: string | Theme): number;
    setSession(id: string): void;
    setDocument(id: string, newSession?: boolean): void;
    update(): void;
    getDOMElement(): HTMLElement | null;
    private _emitInitEvent;
    private _scrollBarInitialConfig;
    private _createEditorContainer;
    private _updateGridLayout;
    private _createInputElement;
    private _updateEditorSize;
    private _initEventListeners;
    private _initSessionEventListeners;
    private _clearSessionEventListeners;
    private _onWrapChanged;
    private _onDocumentEdit;
    private _onTokenizerFinished;
    private _onSelectionChanged;
    private _onLinesCountChanged;
    private _onSearchFinished;
    private _onPaste;
    private _onResize;
    private _onMouseWheel;
    private _onMouseDown;
    private _onBlur;
    private _onKeyDown;
    private _onKeyUp;
    private _onDocumentClick;
    scrollToLine(lineNumber: number): void;
    scrollTolastSelection(): void;
    private _setFocus;
    private _scrollToRow;
    private _scrollToLine;
    private _isCursorVisible;
}
