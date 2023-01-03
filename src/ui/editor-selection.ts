import { Point, Selection } from '../selection';
import { columnToOffset, offsetToColumn } from '../text-utils';
import { CSSClasses } from '../styles/css';
import { createDiv, em, px } from './dom-utils';
import EditorSelectionElement from './editor-selection-element';
import EdiotrView from './editor-view';
import { EvFont, EvKey, EvScroll, EvSearchUi, SelectionLayerEvents } from './events';
import { EventEmitter } from '../events';
import { SelectionType } from '../selection/selection';
import EditSession from '../edit-session/edit-session';
import { EvSearch, EvSelection } from '../edit-session/events';
import { EvDocument } from '../document-session/events';
import { getRelativePositionOfMouseEvent, getRelativePositionOfTouchEvent } from './utils';

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
			const html1 = this._renderSelections();
			const html2 = this._renderCursors();
			const html3 = this._renderSearchResults();
			this._selectionContainer.innerHTML = html1 + html2 + html3;
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
			this.setFirstVisibleLine(e.firstVisibleRow);
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

	private _renderSelections(): string {
		if (this._selectionContainer === null) {
			return '';
		}
		const selections = this._session.getSelctions();
		const rows = this._session.reader.getRows(this._firstVisibleLine, this._visibleLinesCount);
		let html = '';
		if (rows.length === 0) {
			return '';
		}
		if (selections.length === this._visibleSelections.length) {
			for (let i = 0; i < selections.length; i++) {
				this._visibleSelections[i].setSelection(selections[i]);
				html += this._visibleSelections[i].render(rows, this._letterWidth);
			}
		} else {
			this._visibleSelections = [];
			for (let i = 0; i < selections.length; i++) {
				const newSelectionElement = new EditorSelectionElement(selections[i]);
				this._visibleSelections.push(newSelectionElement);
				html += this._visibleSelections[i].render(rows, this._letterWidth);
			}
		}

		return html;
	}

	private _renderCursors(): string {
		if (this._selectionContainer === null) {
			return '';
		}
		const selections = this._session.getSelctions();
		const rows = this._session.reader.getRows(this._firstVisibleLine, this._visibleLinesCount);

		if (rows.length === 0) {
			return '';
		}
		let html = '';
		const firstVisibleLine = rows[0].line;
		const lastVisibleLine = rows[rows.length - 1].line;
		for (const sel of selections) {
			let cursorPos: Point = new Point(0, 0);
			if (sel.type === SelectionType.L) {
				cursorPos = sel.start;
			} else {
				cursorPos = sel.end;
			}

			if (cursorPos.line < firstVisibleLine) {
				continue;
			}
			if (cursorPos.line === firstVisibleLine && cursorPos.offset < rows[0].offset) {
				continue;
			}
			if (cursorPos.line > lastVisibleLine) {
				continue;
			}
			if (
				cursorPos.line === lastVisibleLine &&
				cursorPos.offset > rows[rows.length - 1].offset + rows[rows.length - 1].text.length
			) {
				continue;
			}
			let rowNumber = -1;
			let rowOffset = -1;

			for (rowNumber = 0; rowNumber < rows.length; rowNumber++) {
				const row = rows[rowNumber];
				if (row.line !== cursorPos.line) {
					continue;
				}
				if (
					row.offset <= cursorPos.offset &&
					row.offset + row.text.length >= cursorPos.offset
				) {
					rowOffset = cursorPos.offset - row.offset;
					break;
				}
			}
			if (rowNumber === rows.length) {
				continue;
			}
			const left = offsetToColumn(rows[rowNumber].text, rowOffset) * this._letterWidth;
			const top = rowNumber * this._lineHeight;
			html += `<div class="${
				CSSClasses.CURSOR + ' ' + CSSClasses.CURSOR_ANIMATED
			}" style="top: ${top}px; left: ${left}px"></div>`;
		}
		return html;
	}

	private _renderSearchResults(): string {
		if (this._selectionContainer === null || !this._showSearchResults) {
			return '';
		}
		const rows = this._session.reader.getRows(this._firstVisibleLine, this._visibleLinesCount);
		let html: string = '';

		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const top = i * this._lineHeight;

			for (const match of row.searchResults) {
				const left = offsetToColumn(row.text, match.start.offset);
				const right =
					offsetToColumn(
						row.text.substring(left),
						match.end.offset - match.start.offset,
					) + left;
				const width = (right - left) * this._letterWidth;
				const activeClass = match.isActive ? ' ' + CSSClasses.SELECTION_SEARCH_ACTIVE : '';
				html += `<div class="${CSSClasses.SELECTION_SEARCH + activeClass}" style="top: ${px(
					top,
				)}; left: ${px(left * this._letterWidth)}; width: ${px(width)}; height: ${px(
					this._lineHeight,
				)}"></div>`;
			}
		}
		return html;
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
					firstVisibleRow: lineDiff + this._firstVisibleLine,
					emitterName: this._emitterName,
				});
			}
			this._lastTouchPosition.line = y;
			this._lastTouchPosition.offset = x;
		}
	}

	private _getLineAndOffsetAtPosition(x: number, y: number): [number, number] {
		const rowNumber = Math.floor(y / this._lineHeight) + this._firstVisibleLine;
		let offset = 0;
		let line = 0;

		try {
			const rows = this._session.reader.getRows(rowNumber, 1);
			const row = rows[0];
			const column = Math.round(x / this._letterWidth);
			offset = columnToOffset(row.text, column);
			offset += row.offset;
			line = row.line;
		} catch (err: any) {
			const lineContent = this._session.reader.getLastLine();
			if (lineContent === null) {
				return [0, 0];
			}
			offset = columnToOffset(lineContent.rawText, Infinity);
			line = this._session.reader.getTotalLinesCount() - 1;
		}

		return [line, offset];
	}
}
