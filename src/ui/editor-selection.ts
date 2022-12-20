import { Point, Selection } from '../selection';
import { columnToOffset, offsetToColumn } from '../text-utils';
import { CSSClasses } from '../styles/css';
import { createDiv, em, px } from './dom-utils';
import EditorCursor from './editor-cursor';
import EditorSelectionElement from './editor-selection-element';
import EdiotrView from './editor-view';
import { EvFont, EvKey, EvScroll, EvSearchUi, SelectionLayerEvents } from './events';
import { EventEmitter } from '../events';
import { SelectionType } from '../selection/selection';
import EditSession from '../edit-session/edit-session';
import { EvSearch, EvSelection } from '../edit-session/events';
import { EvDocument } from '../document-session/events';

export default class SelectionLayer extends EventEmitter<SelectionLayerEvents> {
	private _emitterName: string = 'selection-layer';
	private _view: EdiotrView;
	private _mountPoint: HTMLElement | null = null;
	private _selectionContainer: HTMLDivElement | null = null;
	private _firstVisibleLine: number = 0;
	private _visibleLinesCount: number = 20;
	private _lineHeight: number = 20;
	private _letterWidth: number = 0;
	private _visibleSelections: EditorSelectionElement[] = [];
	private _isMouseHold: boolean = false;
	private _isTouchHold: boolean = false;
	private _isTouchSelecting: boolean = false;
	private _isCtrlHold: boolean = false;
	private _isShitHold: boolean = false;
	private _isAltHold: boolean = false;
	private _lastTouchTime: number | null = null;
	private _lastTouchPosition: Point = new Point(0, 0);
	private _showSearchResults: boolean = false;

	constructor(view: EdiotrView) {
		super();

		this._view = view;

		this._mountPoint = view.getDOMElement();
		this._crateSelctionContainer();
		this._initEventListeners();
	}

	private get _session(): EditSession {
		return this._view.session;
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
			const el3 = this._renderSearchResults();
			this._selectionContainer.replaceChildren(...el1, ...el2, ...el3);
		}
	}

	private _crateSelctionContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		this._selectionContainer = createDiv(CSSClasses.SELECTION);
		this._mountPoint.appendChild(this._selectionContainer);
		this._selectionContainer.style.gridArea = '1/2/2/3';
		this._selectionContainer.style.position = 'relative';
		this._selectionContainer.style.zIndex = '4';
		this._selectionContainer.style.marginLeft = em(1);
	}

	private _initEventListeners(): void {
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
		this._view.on(EvKey.AltDown, () => {
			this._isAltHold = true;
		});
		this._view.on(EvKey.AltUp, () => {
			this._isAltHold = false;
		});
		this._view.on(EvSearchUi.Open, () => {
			this._showSearchResults = true;
			this.update();
		});
		this._view.on(EvSearchUi.Close, () => {
			this._showSearchResults = false;
			this.update();
		});

		this._view.on(EvSelection.Changed, () => {
			this.update();
		});
		this._view.on(EvSearch.Finished, () => {
			this.update();
		});
		this._view.on(EvDocument.Set, () => {
			this.update();
		});

		if (this._selectionContainer) {
			this._selectionContainer.addEventListener('mousedown', (e) => this._onMouseDown(e));
			this._selectionContainer.addEventListener('mouseup', () => this._onMouseUp());
			this._selectionContainer.addEventListener('mousemove', (e) => this._onMouseMove(e));
			this._selectionContainer.addEventListener('dblclick', (e) => this._onDoubleClick(e));
			this._selectionContainer.addEventListener('touchstart', (e) => this._onTouchStart(e));
			this._selectionContainer.addEventListener('touchend', () => this._onTouchEnd());
			this._selectionContainer.addEventListener('touchmove', (e) => this._onTouchMove(e));
		}
	}

	private _renderSelections(): HTMLElement[] {
		if (this._selectionContainer === null) {
			return [];
		}
		const selections = this._session.getSelctions();
		const lines = this._session.reader.getLines(
			this._firstVisibleLine,
			this._visibleLinesCount,
		);
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
		if (this._selectionContainer === null) {
			return [];
		}
		const selections = this._session.getSelctions();
		const lines = this._session.reader.getLines(
			this._firstVisibleLine,
			this._visibleLinesCount,
		);
		const cursorElements: HTMLElement[] = [];

		for (const sel of selections) {
			let i = 0;
			let offset = 0;
			if (sel.type === SelectionType.L) {
				i = sel.start.line - this._firstVisibleLine;
				offset = sel.start.offset;
			} else {
				i = sel.end.line - this._firstVisibleLine;
				offset = sel.end.offset;
			}
			if (i >= lines.length || i < 0) {
				continue;
			}
			const lineContent = lines[i];

			const left = offsetToColumn(lineContent.rawText, offset) * this._letterWidth;
			const top = i * this._lineHeight;
			const cursor = new EditorCursor(left, top);
			const cursorElement = cursor.getDOMElment();
			if (cursorElement) {
				cursorElements.push(cursorElement);
			}
		}

		return cursorElements;
	}

	private _renderSearchResults(): HTMLElement[] {
		if (this._selectionContainer === null || !this._showSearchResults) {
			return [];
		}
		const lines = this._session.reader.getLines(
			this._firstVisibleLine,
			this._visibleLinesCount,
		);
		const searchPhraseLength = this._session.getSearchPhrase().length;
		const searchResultElements: HTMLElement[] = [];

		let i = 0;
		for (const line of lines) {
			for (const match of line.searchResults) {
				const resultElement = createDiv(CSSClasses.SELECTION_SEARCH);
				const left = offsetToColumn(line.rawText, match) * this._letterWidth;
				const right =
					offsetToColumn(line.rawText, match + searchPhraseLength) * this._letterWidth;
				const top = i * this._lineHeight;
				resultElement.style.top = px(top);
				resultElement.style.left = px(left);
				resultElement.style.width = px(right - left);
				resultElement.style.height = px(this._lineHeight);
				searchResultElements.push(resultElement);
			}
			i++;
		}

		return searchResultElements;
	}

	private _onMouseDown(e: MouseEvent): void {
		this._isMouseHold = true;
		const [x, y] = getRelativePositionOfMouseEvent(e);
		const [line, offset] = this._getLineAndOffsetAtPosition(x, y);
		const column = Math.round(x / this._letterWidth);

		if (this._isShitHold) {
			if (this._isAltHold) {
				this._session.extendRectangleSelection(new Point(line, column));
			} else {
				this._session.extendLastSelection(new Point(line, offset));
			}
		} else if (this._isCtrlHold) {
			this._session.addSelection(new Selection(line, offset, line, offset));
		} else {
			this._session.setSelection(new Selection(line, offset, line, offset));
		}
	}

	private _onMouseUp(): void {
		this._isMouseHold = false;
	}

	private _onMouseMove(e: MouseEvent): void {
		if (this._isMouseHold) {
			const [x, y] = getRelativePositionOfMouseEvent(e);
			const [line, offset] = this._getLineAndOffsetAtPosition(x, y);
			const column = Math.round(x / this._letterWidth);

			if (this._isShitHold && this._isAltHold) {
				this._session.extendRectangleSelection(new Point(line, column));
			} else {
				this._session.extendLastSelection(new Point(line, offset));
			}
		}
	}

	private _onDoubleClick(e: MouseEvent): void {
		const [x, y] = getRelativePositionOfMouseEvent(e);
		const [line, offset] = this._getLineAndOffsetAtPosition(x, y);

		if (!this._isShitHold) {
			this._session.selectWordAt(new Point(line, offset), this._isCtrlHold);
		}
	}

	private _onTouchStart(e: TouchEvent): void {
		this._isTouchHold = true;
		const [x, y] = getRelativePositionOfTouchEvent(e);
		const [line, offset] = this._getLineAndOffsetAtPosition(x, y);
		const touchTime = performance.now();
		if (this._lastTouchTime !== null) {
			if (touchTime - this._lastTouchTime < 200) {
				this._isTouchSelecting = true;
				this._session.setSelection(new Selection(line, offset, line, offset));
			}
		}
		this._lastTouchTime = touchTime;
		this._lastTouchPosition.line = y;
		this._lastTouchPosition.offset = x;
		e.preventDefault();
		e.stopPropagation();
	}

	private _onTouchEnd(): void {
		this._isTouchHold = false;
		this._isTouchSelecting = false;
	}

	private _onTouchMove(e: TouchEvent): void {
		if (this._isTouchHold) {
			const [x, y] = getRelativePositionOfTouchEvent(e);
			const [line, offset] = this._getLineAndOffsetAtPosition(x, y);

			if (this._isTouchSelecting) {
				this._session.extendLastSelection(new Point(line, offset));
			} else {
				const diffY = this._lastTouchPosition.line - y;
				const lineDiff =
					diffY > 0
						? Math.min(Math.round(diffY / 4), 2)
						: Math.max(Math.round(diffY / 4), -2);
				this.emit(EvScroll.Changed, {
					firstVisibleLine: lineDiff + this._firstVisibleLine,
					emitterName: this._emitterName,
				});
			}
			this._lastTouchPosition.line = y;
			this._lastTouchPosition.offset = x;
		}
	}

	private _getLineAndOffsetAtPosition(x: number, y: number): [number, number] {
		let line = Math.floor(y / this._lineHeight) + this._firstVisibleLine;
		let offset = 0;
		const linesData = this._session.reader.getLines(line, 1);

		if (linesData.length === 0) {
			const lineContent = this._session.reader.getLastLine();
			if (lineContent === null) {
				return [0, 0];
			}
			offset = columnToOffset(lineContent.rawText, Infinity);
			line = this._session.reader.getTotalLinesCount() - 1;
		} else {
			const lineContent = linesData[0];
			const column = Math.round(x / this._letterWidth);
			offset = columnToOffset(lineContent.rawText, column);
		}
		return [line, offset];
	}
}

function getRelativePositionOfMouseEvent(e: MouseEvent): [number, number] {
	const target = e.target as HTMLDivElement;
	const rect = target.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;
	return [x, y];
}

function getRelativePositionOfTouchEvent(e: TouchEvent): [number, number] {
	const target = e.target as HTMLDivElement;
	const rect = target.getBoundingClientRect();
	const x = e.touches[0].clientX - rect.left;
	const y = e.touches[0].clientY - rect.top;
	return [x, y];
}
