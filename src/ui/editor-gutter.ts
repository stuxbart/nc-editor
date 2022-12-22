import { EventEmitter } from '../events';
import { createDiv, px } from './dom-utils';
import EdiotrView from './editor-view';
import { EvGutter, EvScroll, EditorGutterEvents } from './events';
import { CSSClasses } from '../styles/css';
import EditSession from '../edit-session/edit-session';
import { EvDocument } from '../document-session/events';

class EditorGutter extends EventEmitter<EditorGutterEvents> {
	private _view: EdiotrView;
	private _mountPoint: HTMLElement | null = null;
	private _gutterContainer: HTMLDivElement | null = null;
	private _firstVisibleRow: number = 0;
	private _visibleRowsCount: number = 0;
	private _totalRowsCount: number = 50;
	private _gutterWidth: number = 50;

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
		const lines = [];

		for (const row of rows) {
			if (row.ord === 0 || lines.length === 0) {
				const numberDiv = createDiv(CSSClasses.GUTTER_NUMBER);
				numberDiv.innerText = `${row.line + 1}`;
				lines.push(numberDiv);
			} else {
				const numberDiv = createDiv(CSSClasses.GUTTER_NUMBER);
				numberDiv.innerHTML = `&nbsp;`;
				lines.push(numberDiv);
			}
		}

		this._gutterContainer.replaceChildren(...lines);
	}
}

export default EditorGutter;
