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
} from './events';
import { EvDocument, EvTokenizer } from '../editor/events';
import { EDITOR_FONT_FAMILY } from './config';
import { CSSClasses } from '../styles/css';
import { Point } from '../selection';
import { SelectionType } from '../selection/selection';

const MAX_LINES_PADDING = 10;

export default class EditorView extends EventEmitter<EditorViewEvents> {
	private _editor: Editor | null = null;
	private _mountPoint: HTMLElement | null = null;
	private _editorContainer: HTMLDivElement | null = null;
	private _emitterName: string = 'editor-view';

	// View components
	private _textLayer: TextLayer | null = null;
	private _gutter: EditorGutter | null = null;
	private _scrollBar: ScrollBar | null = null;
	private _selectionLayer: SelectionLayer | null = null;
	private _input: EditorInput | null = null;

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
		this._editor = editor;

		this.mount(mountPoint);
		this._editor.addView(this);
		this._textLayer = new TextLayer(editor, this);
		this._selectionLayer = new SelectionLayer(editor, this);
		this._gutter = new EditorGutter(editor, this);
		this._scrollBar = new ScrollBar(editor, this);
		this._input = new EditorInput(editor, this);
		this._scrollBarInitialConfig();
		this._initEventListeners();
		this._createInputElement();
		this._scrollToLine(0, this._emitterName);
		this.setTheme(Theme.Default);
		this._textLayer.measureLetterWidth();
		this._emitInitEvent();
	}

	/*
	 *   Creates entire dom structure of editor.
	 */
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
		document.addEventListener('click', (e) => this._onDocumentClick(e));
		if (this._editorContainer) {
			this._editorContainer.addEventListener('mousewheel', (e: Event) =>
				this._onMouseWheel(e as WheelEvent),
			);
			this._editorContainer.addEventListener('click', () => this._onMouseDown());
			this._editorContainer.addEventListener('blur', () => this._onBlur());
			this._editorContainer.addEventListener('keydown', (e) => this._onKeyDown(e));
			this._editorContainer.addEventListener('keyup', (e) => this._onKeyUp(e));
			this._editorContainer.addEventListener('paste', (e) => this._onPaste(e));
		}
		if (this._editor) {
			this._editor.on(EvDocument.Edited, () => {
				if (this._editor) {
					const selections = this._editor.getSelctions();
					const lastSel = selections[selections.length - 1];
					const editPoint =
						lastSel.type === SelectionType.L ? lastSel.start : lastSel.end;
					const isVisible = this._isCursorVisible(editPoint);
					if (!isVisible) {
						this._scrollToLine(
							editPoint.line - Math.round(this._visibleLinesCount / 2),
							'editor-view',
						);
					}
				}
				// this.update();
			});
			this._editor.on(EvDocument.Set, () => {
				this.update();
			});
			this._editor.on(EvTokenizer.Finished, () => {
				this.update();
			});
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
	}

	private _onPaste(e: ClipboardEvent): void {
		if (!this._editor) {
			return;
		}
		if (e.clipboardData) {
			this._editor.insert(e.clipboardData.getData('text'));
		}
		e.stopPropagation();
		e.preventDefault();
	}

	private _onResize(): void {
		this._updateEditorSize();
		this.update();
	}

	private _onMouseWheel(e: WheelEvent): void {
		const lineDelta = (e.deltaY / Math.abs(e.deltaY)) * 3;

		this._scrollToLine(this._firstVisibleLine + lineDelta, this._emitterName);
		e.preventDefault();
		e.stopPropagation();
	}

	private _onMouseDown(): void {
		this._setFocus(true);
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
				if (this._editor && this._isCtrlHold && !this._isRightAltHold) {
					this._editor.selectAll();
				}
				break;
			}
			case 'ArrowUp': {
				if (this._editor === null) {
					return;
				}
				if (this._isLeftAltHold) {
					this._editor.swapLinesUp();
				} else {
					this._editor.collapseSelectionToTop();
				}
				break;
			}
			case 'ArrowDown': {
				if (this._editor === null) {
					return;
				}
				if (this._isLeftAltHold) {
					this._editor.swapLinesDown();
				} else {
					this._editor.collapseSelectionToBottom();
				}
				break;
			}
			case 'ArrowLeft': {
				if (this._editor === null) {
					return;
				}
				if (this._isShitHold && this._isCtrlHold) {
					this._editor.selectWordBefore();
				} else if (this._isCtrlHold) {
					this._editor.moveSelectionWordBefore();
				} else {
					this._editor.collapseSelectionToLeft();
				}
				break;
			}
			case 'ArrowRight': {
				if (this._editor === null) {
					return;
				}
				if (this._isShitHold && this._isCtrlHold) {
					this._editor.selectWordAfter();
				} else if (this._isCtrlHold) {
					this._editor.moveSelectionWordAfter();
				} else {
					this._editor.collapseSelectionToRight();
				}
				break;
			}
			case 'Home': {
				if (this._editor === null) {
					return;
				}
				if (this._isShitHold) {
					this._editor.selectStartOfTheLine();
				} else {
					this._editor.collapseSelectionToHome();
				}
				break;
			}
			case 'End': {
				if (this._editor === null) {
					return;
				}
				if (this._isShitHold) {
					this._editor.selectEndOfTheLine();
				} else {
					this._editor.collapseSelectionToEnd();
				}
				break;
			}
			case 'Backspace': {
				if (!this._editor) {
					return;
				}
				if (this._isCtrlHold) {
					this._editor.removeWordBefore();
				} else {
					this._editor.remove();
				}
				break;
			}
			case 'Delete': {
				if (!this._editor) {
					return;
				}
				if (this._isCtrlHold) {
					this._editor.removeWordAfter();
				} else {
					this._editor.remove(1);
				}
				break;
			}
			case 'Tab': {
				if (!this._editor) {
					return;
				}
				if (this._isShitHold) {
					this._editor.removeIndentFromSelectedLines();
				} else {
					const linesCount = this._editor.getSelectedLinesCount();
					if (linesCount === 1) {
						this._editor.insert('\t');
					} else {
						this._editor.indentSelectedLines();
					}
				}
				e.stopPropagation();
				e.preventDefault();
				break;
			}
			case 'KeyX': {
				if (!this._editor) {
					return;
				}
				if (this._isCtrlHold) {
					this._editor.cut();
				}
				break;
			}
			case 'KeyC': {
				if (!this._editor) {
					return;
				}
				if (this._isCtrlHold) {
					this._editor.copy();
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
		if (this._editor === null) {
			return;
		}
		let totalLines = this._editor.getTotalLinesCount();
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
