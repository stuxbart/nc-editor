import { Editor } from '../editor';
import { EvSelection } from '../editor/events';
import { Point, Selection } from '../selection';
import { columnToOffset, offsetToColumn } from '../text-utils';
import { EDITOR_SELECTION_CSS_CLASS } from './config';
import { createDiv } from './dom-utils';
import EditorCursor from './editor-cursor';
import EditorSelectionElement from './editor-selection-element';
import EdiotrView from './editor-view';
import { EvFont, EvKey, EvScroll } from './events';

export default class SelectionLayer {
	private _editor: Editor | null = null;
	private _view: EdiotrView | null = null;
	private _mountPoint: HTMLElement | null = null;
	private _selectionContainer: HTMLDivElement | null = null;
	private _firstVisibleLine: number = 0;
	private _visibleLinesCount: number = 20;
	private _lineHeight: number = 20;
	private _letterWidth: number = 0;
	private _visibleSelections: EditorSelectionElement[] = [];
	private _isMouseHold: boolean = false;
	private _isCtrlHold: boolean = false;
	private _isShitHold: boolean = false;

	constructor(editor: Editor, view: EdiotrView) {
		this._editor = editor;
		this._view = view;

		this._mountPoint = view.getDOMElement();
		this._crateSelctionContainer();
		this._initEventListeners();
	}

	public setFirstVisibleLine(firstLine: number): void {
		this._firstVisibleLine = firstLine;
	}

	public setVisibleLinesCount(linesCount: number): void {
		this._visibleLinesCount = linesCount;
	}

	public update(): void {
		if (this._selectionContainer) {
			const el1 = this._renderSelections();
			const el2 = this._renderCursors();
			this._selectionContainer.replaceChildren(...el1, ...el2);
		}
	}

	private _crateSelctionContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		this._selectionContainer = createDiv(EDITOR_SELECTION_CSS_CLASS);
		this._mountPoint.appendChild(this._selectionContainer);
		this._selectionContainer.style.gridArea = '1/2/2/3';
		this._selectionContainer.style.position = 'relative';
		this._selectionContainer.style.zIndex = '4';
		this._selectionContainer.style.marginLeft = '1em';
	}

	private _initEventListeners(): void {
		if (this._view) {
			this._view.on(EvScroll.Changed, (e) => {
				this.setFirstVisibleLine(e.firstVisibleLine);
				this.update();
			});
			this._view.on(EvFont.LetterWidth, (e) => {
				this._letterWidth = e.width;
				this.update();
			});
			this._view.on(EvKey.CtrlDown, () => {
				this._isCtrlHold = true;
			});
			this._view.on(EvKey.CtrlUp, () => {
				this._isCtrlHold = false;
			});
			this._view.on(EvKey.ShiftDown, () => {
				this._isShitHold = true;
			});
			this._view.on(EvKey.ShiftUp, () => {
				this._isShitHold = false;
			});
		}
		if (this._editor) {
			this._editor.on(EvSelection.Changed, () => {
				this.update();
			});
		}
		if (this._selectionContainer) {
			this._selectionContainer.addEventListener('mousedown', (e) => this._onMouseDown(e));
			this._selectionContainer.addEventListener('mouseup', () => this._onMouseUp());
			this._selectionContainer.addEventListener('mousemove', (e) => this._onMouseMove(e));
			this._selectionContainer.addEventListener('dblclick', (e) => this._onDoubleClick(e));
		}
	}

	private _renderSelections(): HTMLElement[] {
		if (this._editor === null || this._selectionContainer === null) {
			return [];
		}
		const selections = this._editor.getSelctions();
		const lines = this._editor.getLines(this._firstVisibleLine, this._visibleLinesCount);
		const selectionElements: HTMLElement[] = [];
		if (selections.length === this._visibleSelections.length) {
			for (let i = 0; i < selections.length; i++) {
				this._visibleSelections[i].setSelection(selections[i]);
				selectionElements.push(
					...this._visibleSelections[i].render(
						this._firstVisibleLine,
						this._visibleLinesCount,
						lines,
						this._letterWidth,
					),
				);
			}
		} else {
			this._visibleSelections = [];
			for (let i = 0; i < selections.length; i++) {
				const newSelectionElement = new EditorSelectionElement(selections[i]);
				this._visibleSelections.push(newSelectionElement);
				selectionElements.push(
					...this._visibleSelections[i].render(
						this._firstVisibleLine,
						this._visibleLinesCount,
						lines,
						this._letterWidth,
					),
				);
			}
		}

		return selectionElements;
	}

	private _renderCursors(): HTMLElement[] {
		if (this._editor === null || this._selectionContainer === null) {
			return [];
		}
		const selections = this._editor.getSelctions();
		const lines = this._editor.getLines(this._firstVisibleLine, this._visibleLinesCount);
		const cursorElements: HTMLElement[] = [];

		for (const sel of selections) {
			const i = sel.end.line - this._firstVisibleLine;
			if (i >= lines.length || i < 0) {
				continue;
			}
			const lineContent = lines[i];
			const left = offsetToColumn(lineContent.rawText, sel.end.offset) * this._letterWidth;
			const top = i * this._lineHeight;
			const cursor = new EditorCursor(left, top);
			const cursorElement = cursor.getDOMElment();
			if (cursorElement) {
				cursorElements.push(cursorElement);
			}
		}

		return cursorElements;
	}

	private _onMouseDown(e: MouseEvent): void {
		this._isMouseHold = true;
		if (this._editor === null) {
			return;
		}
		const target = e.target as HTMLDivElement;
		const rect = target.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		let line = Math.floor(y / this._lineHeight) + this._firstVisibleLine;
		const linesData = this._editor.getLines(line, 1);
		let offset = 0;
		if (linesData.length === 0) {
			const lineContent = this._editor.getLastLine();
			if (lineContent === null) {
				return;
			}
			offset = columnToOffset(lineContent.rawText, Infinity);
			line = this._editor.getTotalLinesCount() - 1;
		} else {
			const lineContent = linesData[0];
			const column = Math.round(x / this._letterWidth);
			offset = columnToOffset(lineContent.rawText, column);
		}

		if (this._isShitHold) {
			this._editor.extendLastSelection(new Point(line, offset));
		} else if (this._isCtrlHold) {
			this._editor.addSelection(new Selection(line, offset, line, offset));
		} else {
			this._editor.setSelection(new Selection(line, offset, line, offset));
		}
	}

	private _onMouseUp(): void {
		this._isMouseHold = false;
	}

	private _onMouseMove(e: MouseEvent): void {
		if (this._isMouseHold && this._editor) {
			const target = e.target as HTMLDivElement;
			const rect = target.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const line = Math.floor(y / this._lineHeight) + this._firstVisibleLine;
			const linesData = this._editor.getLines(line, 1);

			if (linesData.length === 0) {
				const lineContent = this._editor.getLastLine();
				if (lineContent === null) {
					return;
				}
				const offset = columnToOffset(lineContent.rawText, Infinity);
				const line = this._editor.getTotalLinesCount() - 1;
				this._editor.extendLastSelection(new Point(line, offset));
			} else {
				const lineContent = linesData[0];
				const column = Math.round(x / this._letterWidth);
				const offset = columnToOffset(lineContent.rawText, column);
				this._editor.extendLastSelection(new Point(line, offset));
			}
		}
	}

	private _onDoubleClick(e: MouseEvent): void {
		if (this._editor === null) {
			return;
		}
		const target = e.target as HTMLDivElement;
		const rect = target.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		let line = Math.floor(y / this._lineHeight) + this._firstVisibleLine;
		const linesData = this._editor.getLines(line, 1);
		let offset = 0;
		if (linesData.length === 0) {
			const lineContent = this._editor.getLastLine();
			if (lineContent === null) {
				return;
			}
			offset = columnToOffset(lineContent.rawText, Infinity);
			line = this._editor.getTotalLinesCount() - 1;
		} else {
			const lineContent = linesData[0];
			const column = Math.round(x / this._letterWidth);
			offset = columnToOffset(lineContent.rawText, column);
		}

		if (!this._isShitHold) {
			this._editor.selectWordAt(new Point(line, offset), this._isCtrlHold);
		}
	}
}
