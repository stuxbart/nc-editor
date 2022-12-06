import { Editor } from '../editor';
import { EventEmitter } from '../events';
import { EvDocument } from '../editor/events';
import { createDiv, px } from './dom-utils';
import EdiotrView from './editor-view';
import { EvGutter, EvScroll, EvTheme, EditorGutterEvents } from './events';
import { Theme } from './themes';

class EditorGutter extends EventEmitter<EditorGutterEvents> {
	private _editor: Editor | null = null;
	private _view: EdiotrView | null = null;
	private _mountPoint: HTMLElement | null = null;
	private _gutterContainer: HTMLDivElement | null = null;
	private _firstVisibleLine: number = 0;
	private _visibleLinesCount: number = 0;
	private _totalLinesCount: number = 50;
	private _gutterWidth: number = 50;

	constructor(editor: Editor, view: EdiotrView) {
		super();
		this._editor = editor;
		this._view = view;
		this._mountPoint = view.getDOMElement();
		this._createGutterContainer();
		this._initEventListeners();
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
		if (this._view === null) {
			return;
		}
		this._view.on(EvScroll.Changed, (e) => {
			this.setFirstVisibleLine(e.firstVisibleLine);
			this.update();
		});

		this._view.on(EvTheme.Changed, (e) => {
			if (this._gutterContainer === null) {
				return;
			}
			switch (e.theme) {
				case Theme.Dark:
					this._gutterContainer.className = 'nc-editor__gutter nc-editor__gutter--dark';
					break;
				case Theme.Default:
					this._gutterContainer.className =
						'nc-editor__gutter nc-editor__gutter--default';
					break;
				case Theme.Light:
					this._gutterContainer.className = 'nc-editor__gutter nc-editor__gutter--light';
					break;
				default:
					break;
			}
		});
		if (this._editor === null) {
			return;
		}
		this._editor.on(EvDocument.LinesCount, (e) => {
			this.setTotalLinesCount(e.linesCount);
			this.setWidthForLinesCount(e.linesCount);
			this.update();
		});
	}

	private _createGutterContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		this._gutterContainer = createDiv('nc-editor__gutter');
		this._mountPoint.appendChild(this._gutterContainer);
		this._gutterContainer.style.gridArea = '1/1/2/2';
		this._gutterContainer.style.width = '100%';
		this._gutterContainer.style.height = '100%';
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
			const numberDiv = createDiv('nc-gutter__number');
			numberDiv.innerText = `${i + this._firstVisibleLine + 1}`;
			lines.push(numberDiv);
		}
		this._gutterContainer.replaceChildren(...lines);
	}
}

export default EditorGutter;
