import { EventEmitter } from '../events';
import { createDiv, px } from './dom-utils';
import EdiotrView from './editor-view';
import { EvGutter, EvScroll, EditorGutterEvents } from './events';
import { CSSClasses } from '../styles/css';
import EditSession from '../edit-session/edit-session';
import { EvDocument } from '../document-session/events';
import { Point } from '../selection';
import { EvSelection } from '../edit-session/events';

class EditorGutter extends EventEmitter<EditorGutterEvents> {
	private _view: EdiotrView;
	private _mountPoint: HTMLElement | null = null;
	private _gutterContainer: HTMLDivElement | null = null;
	private _firstVisibleRow: number = 0;
	private _visibleRowsCount: number = 0;
	private _totalRowsCount: number = 50;
	private _gutterWidth: number = 50;
	private _isMouseHold: boolean = false;
	private _lineHeight: number = 20;

	constructor(view: EdiotrView) {
		super();
		this._view = view;
		this._mountPoint = view.getDOMElement();
		this._createGutterContainer();
		this._initEventListeners();
		this._totalRowsCount = this._session.reader.getTotalRowsCount();
		this._visibleRowsCount = this._view.visibleRowsCount;
		this.update();
	}

	private get _session(): EditSession {
		return this._view.session;
	}

	public update(): void {
		this._renderLinesNumbers();
	}

	public setWidth(width: number): void {
		this._gutterWidth = width;
	}

	public setWidthForRowsCount(rowsCount: number): number {
		if (this._gutterContainer === null) {
			return this._gutterWidth;
		}
		const chars = rowsCount.toString().length;
		let gutterWidth = chars * 10;
		if (gutterWidth < 50) {
			gutterWidth = 50;
		}

		if (this._gutterWidth !== gutterWidth) {
			this._gutterWidth = chars * 10;
			this._gutterWidth = gutterWidth;
			this._gutterContainer.style.width = px(this._gutterWidth);
		}
		this.emit(EvGutter.Width, { width: this._gutterWidth });
		return this._gutterWidth;
	}

	public setFirstVisibleRow(firstRow: number): void {
		this._firstVisibleRow = firstRow;
	}

	public setVisibleRowsCount(rowsCount: number): void {
		this._visibleRowsCount = rowsCount;
	}

	public setTotalRowsCount(rowsCount: number): void {
		this._totalRowsCount = rowsCount;
	}

	private _initEventListeners(): void {
		this._view.on(EvScroll.Changed, (e) => {
			this.setFirstVisibleRow(e.firstVisibleRow);
			this.update();
		});
		this._view.on(EvDocument.Edited, () => {
			const rowsCount = this._session.reader.getTotalRowsCount();
			this.setTotalRowsCount(rowsCount);
			this.setWidthForRowsCount(rowsCount);
			this.update();
		});
		this._view.on(EvDocument.LinesCount, () => {
			const rowsCount = this._session.reader.getTotalRowsCount();
			this.setTotalRowsCount(rowsCount);
			this.setWidthForRowsCount(rowsCount);
			this.update();
		});
		this._view.on(EvDocument.Set, () => {
			const rowsCount = this._session.reader.getTotalRowsCount();
			this.setTotalRowsCount(rowsCount);
			this.setWidthForRowsCount(rowsCount);
			this.update();
		});
		this._view.on(EvSelection.Changed, () => {
			this.update();
		});

		if (this._gutterContainer) {
			this._gutterContainer.addEventListener('mousedown', (e) => this._onMouseDown(e));
			this._gutterContainer.addEventListener('mouseup', () => this._onMouseUp());
			this._gutterContainer.addEventListener('mousemove', (e) => this._onMouseMove(e));
		}
	}

	private _createGutterContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		this._gutterContainer = createDiv(CSSClasses.GUTTER);
		this._mountPoint.appendChild(this._gutterContainer);
		this._gutterContainer.style.gridArea = '1/1/2/2';
	}

	private _renderLinesNumbers(): void {
		if (this._gutterContainer === null) {
			return;
		}

		const rows = this._session.reader.getRows(this._firstVisibleRow, this._visibleRowsCount);
		const lineNumbers = rows.map((row) => row.line);
		const firstVisibleLine = Math.min(...lineNumbers);
		const lastVisibleLine = Math.max(...lineNumbers);
		const activeLines = this._session.getActiveLinesNumbers(
			firstVisibleLine,
			lastVisibleLine - firstVisibleLine + 1,
		);
		const lines = [];

		for (const row of rows) {
			const numberDiv = createDiv(CSSClasses.GUTTER_NUMBER);
			lines.push(numberDiv);
			if (row.ord === 0 || lines.length === 0) {
				numberDiv.innerText = `${row.line + 1}`;
			} else {
				numberDiv.innerHTML = `&nbsp;`;
			}
			if (activeLines.has(row.line)) {
				numberDiv.classList.add(CSSClasses.GUTTER_NUMBER_ACTIVE);
			}
		}

		this._gutterContainer.replaceChildren(...lines);
	}

	private _onMouseDown(e: MouseEvent): void {
		this._isMouseHold = true;
		const target = e.target as HTMLDivElement;
		if (!target.parentElement) {
			return;
		}
		const rect = target.parentElement.getBoundingClientRect();
		const y = e.clientY - rect.top;
		const line = this._getRowAtPosition(y);

		this._session.selectLine(line);
	}

	private _onMouseUp(): void {
		this._isMouseHold = false;
	}

	private _onMouseMove(e: MouseEvent): void {
		if (!this._isMouseHold) {
			return;
		}

		const target = e.target as HTMLDivElement;
		if (!target.parentElement) {
			return;
		}
		const rect = target.parentElement.getBoundingClientRect();
		const y = e.clientY - rect.top;
		const line = this._getRowAtPosition(y);

		this._session.extendLastSelection(new Point(line, 0));
	}

	private _getRowAtPosition(y: number): number {
		const rowNumber = Math.floor(y / this._lineHeight) + this._firstVisibleRow;
		let line = 0;

		try {
			const rows = this._session.reader.getRows(rowNumber, 1);
			line = rows[0].line;
		} catch (err: any) {
			line = this._session.reader.getTotalLinesCount() - 1;
		}

		return line;
	}
}

export default EditorGutter;
