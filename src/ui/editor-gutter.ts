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
	private _firstVisibleLine: number = 0;
	private _visibleLinesCount: number = 0;
	private _totalLinesCount: number = 50;
	private _gutterWidth: number = 50;

	constructor(view: EdiotrView) {
		super();
		this._view = view;
		this._mountPoint = view.getDOMElement();
		this._createGutterContainer();
		this._initEventListeners();
		this._totalLinesCount = this._session.reader.getTotalLinesCount();
		this._visibleLinesCount = this._view.visibleLinesCount;
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

	public setWidthForLinesCount(linesCount: number): number {
		if (this._gutterContainer === null) {
			return this._gutterWidth;
		}
		const chars = linesCount.toString().length;
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

	public setFirstVisibleLine(firstLine: number): void {
		this._firstVisibleLine = firstLine;
	}

	public setVisibleLinesCount(linesCount: number): void {
		this._visibleLinesCount = linesCount;
	}

	public setTotalLinesCount(linesCount: number): void {
		this._totalLinesCount = linesCount;
	}

	private _initEventListeners(): void {
		this._view.on(EvScroll.Changed, (e) => {
			this.setFirstVisibleLine(e.firstVisibleLine);
			this.update();
		});
		this._session.documentSession.on(EvDocument.LinesCount, (e) => {
			this.setTotalLinesCount(e.linesCount);
			this.setWidthForLinesCount(e.linesCount);
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

		const lines = [];
		for (let i = 0; i < this._visibleLinesCount; i++) {
			if (i + this._firstVisibleLine > this._totalLinesCount - 1) {
				break;
			}
			const numberDiv = createDiv(CSSClasses.GUTTER_NUMBER);
			numberDiv.innerText = `${i + this._firstVisibleLine + 1}`;
			lines.push(numberDiv);
		}
		this._gutterContainer.replaceChildren(...lines);
	}
}

export default EditorGutter;
