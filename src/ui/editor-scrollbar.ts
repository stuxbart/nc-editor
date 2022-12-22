import { createDiv, px } from './dom-utils';
import { EventEmitter } from '../events';
import EdiotrView from './editor-view';
import { EvScroll, EvWrap, ScrollBarEvents } from './events';

import { MAX_LINES_COUNT_ON_DEFAULT_SCROLL_SCALE } from './config';
import { CSSClasses } from '../styles/css';
import EditSession from '../edit-session/edit-session';
import { EvDocument } from '../document-session/events';

export default class ScrollBar extends EventEmitter<ScrollBarEvents> {
	private _view: EdiotrView;
	private _mountPoint: HTMLElement | null = null;
	private _emitterName: string = 'scroll-bar';
	private _scrollBarContainer: HTMLDivElement | null = null;
	private _scrollableDiv: HTMLDivElement | null = null;
	private _firstVisibleRow: number = 0;
	private _visibleRowsCount: number = 0;
	private _totalRowsCount: number = 50;
	private _maxRowsPadding: number = 10;
	private _scale: number = 20;

	constructor(view: EdiotrView) {
		super();
		this._view = view;
		this._mountPoint = view.getDOMElement();
		this._createScrollContainer();
		this._initEventListeners();
	}

	private get _session(): EditSession {
		return this._view.session;
	}

	public update(): void {
		this._updateScrollPosition();
	}

	public setTotalRowsCount(rowsCount: number): void {
		console.log(rowsCount);
		this._totalRowsCount = rowsCount;
		this._updateScale();
		if (this._scrollableDiv) {
			let height = (rowsCount + this._maxRowsPadding) * this._scale;
			if (this._totalRowsCount > MAX_LINES_COUNT_ON_DEFAULT_SCROLL_SCALE) {
				height *= 1.01;
			}
			this._scrollableDiv.style.height = px(height);
		}
	}

	public setFirstVisibleRow(firstRow: number): void {
		this._firstVisibleRow = firstRow;
	}

	public setVisibleRowsCount(rowsCount: number): void {
		this._visibleRowsCount = rowsCount;
	}

	public setMaxRowsPadding(rowsCount: number): void {
		this._maxRowsPadding = rowsCount;
	}

	private _createScrollContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		this._scrollBarContainer = createDiv(CSSClasses.SCROLL_BAR);
		this._scrollableDiv = createDiv(CSSClasses.SCROLL_INNER);
		this._scrollBarContainer.appendChild(this._scrollableDiv);
		this._mountPoint.appendChild(this._scrollBarContainer);
		this._scrollBarContainer.style.gridArea = '1/3/2/4';
	}

	private _updateScrollPosition(): void {
		if (this._scrollBarContainer === null) {
			return;
		}
		this._scrollBarContainer.scrollTop = Math.ceil(this._firstVisibleRow * this._scale);
	}

	private _initEventListeners(): void {
		if (this._scrollBarContainer) {
			this._scrollBarContainer.addEventListener('mousedown', () => {
				this._onMouseDown();
			});
			this._scrollBarContainer.addEventListener('mouseup', () => {
				this._onMouseUp();
			});
		}

		this._view.on(EvScroll.Changed, (e) => {
			if (e.emitterName === this._emitterName) {
				return;
			}
			this.setFirstVisibleRow(e.firstVisibleRow);
			this.update();
		});

		this._view.on(EvDocument.Edited, () => {
			const rowsCount = this._session.reader.getTotalRowsCount();
			this.setTotalRowsCount(rowsCount);
		});

		this._view.on(EvDocument.LinesCount, () => {
			const rowsCount = this._session.reader.getTotalRowsCount();
			this.setTotalRowsCount(rowsCount);
		});

		this._view.on(EvDocument.Set, () => {
			const rowsCount = this._session.reader.getTotalRowsCount();
			this.setTotalRowsCount(rowsCount);
		});

		this._view.on(EvWrap.Changed, () => {
			const rowsCount = this._session.reader.getTotalRowsCount();
			this.setTotalRowsCount(rowsCount);
		});
	}

	private _onScroll = (): void => {
		if (this._scrollBarContainer === null) {
			return;
		}
		const newRowNumber = Math.ceil(this._scrollBarContainer.scrollTop / this._scale);

		this._firstVisibleRow = newRowNumber;
		this.emit(EvScroll.Changed, {
			firstVisibleRow: newRowNumber,
			emitterName: this._emitterName,
		});
	};

	private _onMouseDown(): void {
		if (this._scrollBarContainer) {
			this._scrollBarContainer.addEventListener('scroll', this._onScroll);
		}
	}

	private _onMouseUp(): void {
		if (this._scrollBarContainer) {
			this._scrollBarContainer.removeEventListener('scroll', this._onScroll);
		}
	}

	private _updateScale(): void {
		if (this._totalRowsCount > MAX_LINES_COUNT_ON_DEFAULT_SCROLL_SCALE) {
			this._scale = 0.1;
		} else {
			this._scale = 20;
		}
	}
}
