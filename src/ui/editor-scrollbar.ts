import { Editor } from '../editor';
import { createDiv, px } from './dom-utils';
import { EventEmitter } from '../events';
import EdiotrView from './editor-view';
import { EvScroll, ScrollBarEvents } from './events';
import { EvDocument } from '../editor/events';
import { MAX_LINES_COUNT_ON_DEFAULT_SCROLL_SCALE } from './config';

export default class ScrollBar extends EventEmitter<ScrollBarEvents> {
	private _editor: Editor | null = null;
	private _view: EdiotrView | null = null;
	private _mountPoint: HTMLElement | null = null;
	private _emitterName: string = 'scroll-bar';
	private _scrollBarContainer: HTMLDivElement | null = null;
	private _scrollableDiv: HTMLDivElement | null = null;
	private _firstVisibleLine: number = 0;
	private _visibleLinesCount: number = 0;
	private _totalLinesCount: number = 50;
	private _maxLinesPadding: number = 10;
	private _scale: number = 20;

	constructor(editor: Editor, view: EdiotrView) {
		super();
		this._editor = editor;
		this._view = view;
		this._mountPoint = view.getDOMElement();
		this._createScrollContainer();
		this._initEventListeners();
	}

	public update(): void {
		this._updateScrollPosition();
	}

	public setTotalLinesCount(linesCount: number): void {
		this._totalLinesCount = linesCount;
		this._updateScale();
		if (this._scrollableDiv) {
			let height = (linesCount + this._maxLinesPadding) * this._scale;
			if (this._totalLinesCount > MAX_LINES_COUNT_ON_DEFAULT_SCROLL_SCALE) {
				height *= 1.01;
			}
			this._scrollableDiv.style.height = px(height);
		}
	}

	public setFirstVisibleLine(firstLine: number): void {
		this._firstVisibleLine = firstLine;
	}

	public setVisibleLinesCount(linesCount: number): void {
		this._visibleLinesCount = linesCount;
	}

	public setMaxLinesPadding(linesCount: number): void {
		this._maxLinesPadding = linesCount;
	}

	private _createScrollContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		this._scrollBarContainer = createDiv('nc-editor__scroll-bar');
		this._scrollableDiv = createDiv('nc-scroll__scrollable');
		this._scrollBarContainer.appendChild(this._scrollableDiv);
		this._mountPoint.appendChild(this._scrollBarContainer);
		this._scrollBarContainer.style.gridArea = '1/3/2/4';
		this._scrollBarContainer.style.width = '100%';
		this._scrollBarContainer.style.height = '100%';
		this._scrollBarContainer.style.maxHeight = '100%';
		this._scrollableDiv.style.width = '15px';
	}

	private _updateScrollPosition(): void {
		if (this._scrollBarContainer === null) {
			return;
		}
		this._scrollBarContainer.scrollTop = this._firstVisibleLine * this._scale;
	}

	private _initEventListeners(): void {
		if (this._scrollBarContainer) {
			this._scrollBarContainer.addEventListener('scroll', () => {
				this._onScroll();
			});
		}
		if (this._view) {
			this._view.on(EvScroll.Changed, (e) => {
				if (e.emitterName === this._emitterName) {
					return;
				}
				this.setFirstVisibleLine(e.firstVisibleLine);
				this.update();
			});
		}
		if (this._editor) {
			this._editor.on(EvDocument.LinesCount, (e) => {
				this.setTotalLinesCount(e.linesCount);
			});
		}
	}

	private _onScroll(): void {
		if (this._scrollBarContainer === null) {
			return;
		}
		const newLineNumber = Math.ceil(this._scrollBarContainer.scrollTop / this._scale);
		if (newLineNumber !== this._firstVisibleLine) {
			this._firstVisibleLine = newLineNumber;
			this.emit(EvScroll.Changed, {
				firstVisibleLine: newLineNumber,
				emitterName: this._emitterName,
			});
		}
	}

	private _updateScale(): void {
		if (this._totalLinesCount > MAX_LINES_COUNT_ON_DEFAULT_SCROLL_SCALE) {
			this._scale = 0.1;
		} else {
			this._scale = 20;
		}
	}
}
