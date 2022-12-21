import { Editor } from '../editor';
import { EventEmitter } from '../events';
import TextLayer from './ediotr-text';
import EditorGutter from './editor-gutter';
import ScrollBar from './editor-scrollbar';
import SelectionLayer from './editor-selection';
import EditorInput from './editor-input';
import { createDiv, isChildOf, px } from './dom-utils';
import { BASE_THEME_CLASS, DEFAULT_THEME, Theme, VALID_THEMES } from './themes';
import {
	EvScroll,
	EvFocus,
	EvTheme,
	EvFont,
	EvGutter,
	EvView,
	EditorViewEvents,
	EvKey,
	EvSearchUi,
} from './events';
import { EDITOR_FONT_FAMILY } from './config';
import { CSSClasses } from '../styles/css';
import { Point } from '../selection';
import { SelectionType } from '../selection/selection';
import EditorSearch from './editor-search';
import EditSession from '../edit-session/edit-session';
import DocumentSession from '../document-session/document-session';
import { Document } from '../document';
import { EvDocument, EvTokenizer } from '../document-session/events';
import DocumentReader from '../document-reader/document-reader';
import DocumentWriter from '../document-writer/document-writer';
import { EvSearch, EvSelection } from '../edit-session/events';

const MAX_LINES_PADDING = 10;

export default class EditorView extends EventEmitter<EditorViewEvents> {
	private _editor: Editor;
	private _sessionId: string;
	private _session: EditSession;
	private _docSession: DocumentSession;
	private _mountPoint: HTMLElement | null = null;
	private _editorContainer: HTMLDivElement | null = null;
	private _emitterName: string = 'editor-view';

	// View components
	private _textLayer: TextLayer | null = null;
	private _gutter: EditorGutter | null = null;
	private _scrollBar: ScrollBar | null = null;
	private _selectionLayer: SelectionLayer | null = null;
	private _input: EditorInput | null = null;
	private _search: EditorSearch | null = null;

	private _firstVisibleLine: number = 0;
	private _visibleLinesCount: number = 0;
	private _scrollHeight: number = 0;
	private _scrollWidth: number = 0;
	private _scrollLeft: number = 0;
	private _scrollbarWidth: number = 15;
	private _gutterWidth: number = 50;

	private _isFocused: boolean = false;
	private _height: number = 0;
	private _width: number = 0;
	private _lineHeight: number = 20;
	private _fontSize: number = 12;
	private _fontFamily: string = EDITOR_FONT_FAMILY;
	private _letterWidth: number = 8;

	private _hoverLineNumber: number = -1;
	private _activeLineNumber: number = -1;

	private _isCtrlHold: boolean = false;
	private _isShitHold: boolean = false;
	private _isLeftAltHold: boolean = false;
	private _isRightAltHold: boolean = false;

	private _theme: Theme = Theme.Default;

	constructor(editor: Editor, mountPoint: HTMLElement | string) {
		super();
		this._onDocumentEdit = this._onDocumentEdit.bind(this);
		this._onTokenizerFinished = this._onTokenizerFinished.bind(this);
		this._onSelectionChanged = this._onSelectionChanged.bind(this);
		this._onLinesCountChanged = this._onLinesCountChanged.bind(this);
		this._onSearchFinished = this._onSearchFinished.bind(this);

		this._editor = editor;

		let docId = editor.getLatestDocumentId();

		if (!docId) {
			const newDoc = new Document('doc');
			docId = editor.addDocument(newDoc);
		}

		this._sessionId = editor.createSession(docId);
		this._session = editor.getSession(this._sessionId);
		this._docSession = editor.getDocumentSession(docId);

		this.mount(mountPoint);

		this._textLayer = new TextLayer(this);
		this._selectionLayer = new SelectionLayer(this);
		this._gutter = new EditorGutter(this);
		this._scrollBar = new ScrollBar(this);
		this._input = new EditorInput(this);
		this._search = new EditorSearch(this);

		this._scrollBarInitialConfig();
		this._initEventListeners();
		this._createInputElement();
		this._scrollToLine(0, this._emitterName);
		this.setTheme(Theme.Default);
		this._textLayer.measureLetterWidth();
		this._emitInitEvent();
	}

	public get session(): EditSession {
		return this._session;
	}

	public get reader(): DocumentReader {
		return this._session.reader;
	}

	public get writer(): DocumentWriter {
		return this._session.writer;
	}

	public get visibleLinesCount(): number {
		return this._visibleLinesCount;
	}

	public mount(parent: HTMLElement | string): number {
		if (typeof parent === 'string') {
			const p = document.getElementById(parent);
			if (p === null) {
				throw new Error(`Element with id="${parent}" does not exist.`);
			}
			this._mountPoint = p;
		} else if (typeof parent === HTMLElement.toString()) {
			this._mountPoint = parent;
		}
		this._createEditorContainer();
		this._updateEditorSize();
		this._createInputElement();
		this.setTheme(DEFAULT_THEME);

		return 0;
	}

	public unmount(): void {
		if (this._mountPoint) {
			this._mountPoint.textContent = '';
		}
	}

	public setTheme(_theme: string | Theme): number {
		const theme: Theme = _theme as Theme;
		let isValid: boolean = false;

		for (const vtheme of VALID_THEMES) {
			if (vtheme === theme && vtheme.length === theme.length) {
				isValid = true;
				break;
			}
		}
		if (!isValid) {
			throw new Error('Invalid theme name');
		}
		this._theme = theme;
		if (this._editorContainer === null) {
			return 1;
		}
		for (const vtheme of VALID_THEMES) {
			this._editorContainer.classList.remove(BASE_THEME_CLASS + vtheme);
		}
		this._editorContainer.classList.add(BASE_THEME_CLASS + theme);

		this.emit(EvTheme.Changed, { theme: this._theme });
		return 0;
	}

	public setSession(id: string): void {
		this._session = this._editor.getSession(id);
		this._docSession = this._session.documentSession;
		this._sessionId = id;
		this._clearSessionEventListeners();
		this._initSessionEventListeners();
		this.emit(EvDocument.Set, undefined);
	}

	public setDocument(id: string, newSession: boolean = false): void {
		if (newSession) {
			this._sessionId = this._editor.createSession(id);
			this._session = this._editor.getSession(this._sessionId);
			this._docSession = this._editor.getDocumentSession(id);
		} else {
			this._session = this._editor.getEditSessionForDocument(id);
			this._docSession = this._session.documentSession;
			this._sessionId = this._session.id;
		}
		this._clearSessionEventListeners();
		this._initSessionEventListeners();
		this.emit(EvDocument.Set, undefined);
	}

	public update(): void {
		this._updateEditorSize();
	}

	public getDOMElement(): HTMLElement | null {
		return this._editorContainer;
	}

	private _emitInitEvent(): void {
		this.emit(EvView.Initialized, undefined);
	}

	private _scrollBarInitialConfig(): void {
		if (this._scrollBar) {
			this._scrollBar.setMaxLinesPadding(MAX_LINES_PADDING);
		}
	}

	private _createEditorContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		this._editorContainer = createDiv(CSSClasses.EDITOR);
		this._mountPoint.appendChild(this._editorContainer);
		this._editorContainer.style.fontFamily = this._fontFamily;
		this._editorContainer.style.fontSize = px(this._fontSize);
		this._editorContainer.style.lineHeight = px(this._lineHeight);
		this._updateGridLayout();
	}

	private _updateGridLayout(): void {
		if (this._editorContainer) {
			this._editorContainer.style.gridTemplate = `100% / ${px(this._gutterWidth)} 1fr ${px(
				this._scrollbarWidth,
			)}`;
		}
	}
	private _createInputElement(): void {
		if (this._editorContainer && this._input) {
			this._input.render(this._editorContainer);
		}
	}

	private _updateEditorSize(): void {
		if (this._editorContainer === null) {
			return;
		}
		this._height = this._editorContainer.clientHeight;
		this._width = this._editorContainer.clientWidth;
		this._visibleLinesCount = Math.ceil(this._height / this._lineHeight);

		if (this._gutter) {
			this._gutter.setVisibleLinesCount(this._visibleLinesCount);
		}
		if (this._textLayer) {
			this._textLayer.setVisibleLinesCount(this._visibleLinesCount);
		}
		if (this._scrollBar) {
			this._scrollBar.setVisibleLinesCount(this._visibleLinesCount);
		}
		if (this._selectionLayer) {
			this._selectionLayer.setVisibleLinesCount(this._visibleLinesCount);
		}
	}

	private _initEventListeners(): void {
		window.addEventListener('resize', () => this._onResize());
		if (this._editorContainer) {
			this._editorContainer.addEventListener('mousewheel', (e: Event) =>
				this._onMouseWheel(e as WheelEvent),
			);
			this._editorContainer.addEventListener('click', (e) => this._onMouseDown(e));
			this._editorContainer.addEventListener('blur', () => this._onBlur());
			this._editorContainer.addEventListener('keydown', (e) => this._onKeyDown(e));
			this._editorContainer.addEventListener('keyup', (e) => this._onKeyUp(e));
			this._editorContainer.addEventListener('paste', (e) => this._onPaste(e));
		}

		if (this._scrollBar) {
			this._scrollBar.on(EvScroll.Changed, (e) => {
				this._scrollToLine(e.firstVisibleLine, e.emitterName);
			});
		}
		if (this._textLayer) {
			this._textLayer.on(EvFont.LetterWidth, (e) => {
				this._letterWidth = e.width;
				this.emit(EvFont.LetterWidth, { width: e.width });
			});
		}
		if (this._gutter) {
			this._gutter.on(EvGutter.Width, (e) => {
				this._gutterWidth = e.width;
				this._updateGridLayout();
			});
		}
		if (this._selectionLayer) {
			this._selectionLayer.on(EvScroll.Changed, (e) => {
				this._scrollToLine(e.firstVisibleLine, e.emitterName);
			});
		}
		if (this._search) {
			this._search.on(EvSearchUi.Close, () => {
				this.emit(EvSearchUi.Close, undefined);
				this._setFocus(true);
			});
		}
		this._initSessionEventListeners();
	}

	private _initSessionEventListeners(): void {
		// eslint-disable-next-line @typescript-eslint/unbound-method
		this._docSession.on(EvDocument.Edited, this._onDocumentEdit);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		this._docSession.on(EvTokenizer.Finished, this._onTokenizerFinished);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		this._session.on(EvSelection.Changed, this._onSelectionChanged);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		this._docSession.on(EvDocument.LinesCount, this._onLinesCountChanged);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		this._session.on(EvSearch.Finished, this._onSearchFinished);
	}

	private _clearSessionEventListeners(): void {
		// eslint-disable-next-line @typescript-eslint/unbound-method
		this._docSession.off(EvDocument.Edited, this._onDocumentEdit);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		this._docSession.off(EvTokenizer.Finished, this._onTokenizerFinished);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		this._session.off(EvSelection.Changed, this._onSelectionChanged);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		this._docSession.off(EvDocument.LinesCount, this._onLinesCountChanged);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		this._session.off(EvSearch.Finished, this._onSearchFinished);
	}

	private _onDocumentEdit(): void {
		const selections = this._session.getSelctions();
		const lastSel = selections[selections.length - 1];
		const editPoint = lastSel.type === SelectionType.L ? lastSel.start : lastSel.end;
		const isVisible = this._isCursorVisible(editPoint);
		if (!isVisible) {
			this._scrollToLine(
				editPoint.line - Math.round(this._visibleLinesCount / 2),
				'editor-view',
			);
		}
		this.emit(EvDocument.Edited, undefined);
	}

	private _onTokenizerFinished(): void {
		this.update();
		this.emit(EvTokenizer.Finished, undefined);
	}

	private _onSelectionChanged(): void {
		this.emit(EvSelection.Changed, undefined);
	}

	private _onLinesCountChanged(e: { linesCount: number }): void {
		this.emit(EvDocument.LinesCount, e);
	}

	private _onSearchFinished(): void {
		this.emit(EvSearch.Finished, undefined);
	}

	private _onPaste(e: ClipboardEvent): void {
		if (e.clipboardData) {
			this.writer.insert(e.clipboardData.getData('text'));
		}
		e.stopPropagation();
		e.preventDefault();
	}

	private _onResize(): void {
		this._updateEditorSize();
		this.update();
	}

	private _onMouseWheel(e: WheelEvent): void {
		const lineDelta = Math.round((e.deltaY / Math.abs(e.deltaY)) * 3);
		this._scrollToLine(this._firstVisibleLine + lineDelta, this._emitterName);
		e.preventDefault();
		e.stopPropagation();
	}

	private _onMouseDown(e: MouseEvent): void {
		if (!this._search || !isChildOf(this._search.getDOMElement() as Node, e.target as Node)) {
			this._setFocus(true);
		}
	}

	private _onBlur(): void {
		this._setFocus(false);
		this.update();
	}

	private _onKeyDown(e: KeyboardEvent): void {
		switch (e.code) {
			case 'ControlLeft': {
				this._isCtrlHold = true;
				this.emit(EvKey.CtrlDown, undefined);
				break;
			}
			case 'ShiftLeft': {
				this._isShitHold = true;
				this.emit(EvKey.ShiftDown, undefined);
				break;
			}
			case 'AltLeft': {
				this._isLeftAltHold = true;
				this.emit(EvKey.AltDown, undefined);
				break;
			}
			case 'AltRight': {
				this._isRightAltHold = true;
				break;
			}
			case 'KeyA': {
				if (this._isCtrlHold && !this._isRightAltHold) {
					this._session.selectAll();
				}
				break;
			}
			case 'ArrowUp': {
				if (this._isLeftAltHold) {
					this.writer.swapLinesUp();
				} else {
					this._session.collapseSelectionToTop();
				}
				break;
			}
			case 'ArrowDown': {
				if (this._isLeftAltHold) {
					this.writer.swapLinesDown();
				} else {
					this._session.collapseSelectionToBottom();
				}
				break;
			}
			case 'ArrowLeft': {
				if (this._isShitHold && this._isCtrlHold) {
					this._session.selectWordBefore();
				} else if (this._isCtrlHold) {
					this._session.moveSelectionWordBefore();
				} else {
					this._session.collapseSelectionToLeft();
				}
				break;
			}
			case 'ArrowRight': {
				if (this._isShitHold && this._isCtrlHold) {
					this._session.selectWordAfter();
				} else if (this._isCtrlHold) {
					this._session.moveSelectionWordAfter();
				} else {
					this._session.collapseSelectionToRight();
				}
				break;
			}
			case 'Home': {
				if (this._isShitHold) {
					this._session.selectStartOfTheLine();
				} else {
					this._session.collapseSelectionToHome();
				}
				break;
			}
			case 'End': {
				if (this._isShitHold) {
					this._session.selectEndOfTheLine();
				} else {
					this._session.collapseSelectionToEnd();
				}
				break;
			}
			case 'Backspace': {
				if (this._isCtrlHold) {
					this.writer.removeWordBefore();
				} else {
					this.writer.remove();
				}
				break;
			}
			case 'Delete': {
				if (this._isCtrlHold) {
					this.writer.removeWordAfter();
				} else {
					this.writer.remove(1);
				}
				break;
			}
			case 'Tab': {
				if (this._isShitHold) {
					this.writer.removeIndentFromSelectedLines();
				} else {
					const linesCount = this._session.getSelectedLinesCount();
					if (linesCount === 1) {
						this.writer.insert('\t');
					} else {
						this.writer.indentSelectedLines();
					}
				}
				e.stopPropagation();
				e.preventDefault();
				break;
			}
			case 'KeyX': {
				if (this._isCtrlHold) {
					this.writer.cut();
				}
				break;
			}
			case 'KeyC': {
				if (this._isCtrlHold) {
					this.writer.copy();
				}
				break;
			}
			case 'KeyF': {
				if (this._isCtrlHold) {
					this.emit(EvSearchUi.Open, undefined);
					e.preventDefault();
					e.stopPropagation();
				}
				break;
			}
			case 'KeyZ': {
				if (this._isCtrlHold) {
					this._docSession.undo();
					e.preventDefault();
					e.stopPropagation();
				}
				break;
			}
			case 'KeyY': {
				if (this._isCtrlHold) {
					this._docSession.redo();
					e.preventDefault();
					e.stopPropagation();
				}
				break;
			}
			default:
				break;
		}
	}

	private _onKeyUp(e: KeyboardEvent): void {
		switch (e.code) {
			case 'ControlLeft': {
				this._isCtrlHold = false;
				this.emit(EvKey.CtrlUp, undefined);
				break;
			}
			case 'ShiftLeft': {
				this._isShitHold = false;
				this.emit(EvKey.ShiftUp, undefined);
				break;
			}
			case 'AltLeft': {
				this._isLeftAltHold = false;
				this.emit(EvKey.AltUp, undefined);
				break;
			}
			case 'AltRight': {
				this._isRightAltHold = false;
				break;
			}
			default:
				break;
		}
	}

	private _onDocumentClick(e: Event): void {
		const activeElement = e.target as Node;
		if (isChildOf(this._editorContainer, activeElement)) {
			this._setFocus(true);
			this.update();
		} else {
			this._setFocus(false);
			this.update();
		}
	}

	public scrollToLine(lineNumber: number): void {
		this._scrollToLine(lineNumber, this._emitterName);
	}

	private _setFocus(focus: boolean): void {
		this._isFocused = focus;
		this.emit(EvFocus.Changed, { focused: focus });
	}

	private _scrollToLine(lineNumber: number, emitterName: string = this._emitterName): void {
		let totalLines = this.reader.getTotalLinesCount();
		totalLines = totalLines < 0 ? 0 : totalLines;

		if (lineNumber < 0) {
			this._firstVisibleLine = 0;
		} else if (totalLines - this._visibleLinesCount < 0) {
			this._firstVisibleLine = 0;
		} else if (lineNumber > totalLines - this._visibleLinesCount + MAX_LINES_PADDING) {
			this._firstVisibleLine = totalLines - this._visibleLinesCount + MAX_LINES_PADDING;
		} else {
			this._firstVisibleLine = lineNumber;
		}

		this.emit(EvScroll.Changed, {
			firstVisibleLine: this._firstVisibleLine,
			emitterName: emitterName,
		});

		this.update();
	}

	private _isCursorVisible(cursorPos: Point): boolean {
		if (cursorPos.line < this._firstVisibleLine) {
			return false;
		}
		if (cursorPos.line > this._firstVisibleLine + this._visibleLinesCount) {
			return false;
		}
		return true;
	}
}
