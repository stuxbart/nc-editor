import { Editor } from '../editor';
import { EvSelection } from '../editor/events';
import { Selection } from '../selection';
import { columnToOffset, offsetToColumn } from '../text-utils';
import { notEmpty } from '../utils';
import { createDiv } from './dom-utils';
import EditorCursor from './editor-cursor';
import EdiotrView from './editor-view';
import { EvFont, EvScroll } from './events';

export default class SelectionLayer {
	private _editor: Editor | null = null;
	private _view: EdiotrView | null = null;
	private _mountPoint: HTMLElement | null = null;
	private _selectionContainer: HTMLDivElement | null = null;
	private _firstVisibleLine: number = 0;
	private _visibleLinesCount: number = 20;
	private _lineHeight: number = 20;
	private _letterWidth: number = 0;
	private _visibleSelections: any[] = [];

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
		this._renderSelections();
	}

	private _crateSelctionContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		this._selectionContainer = createDiv('nc-editor__selection');
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
				console.log(e.width);
				this._letterWidth = e.width;
				this.update();
			});
		}
		if (this._editor) {
			this._editor.on(EvSelection.Changed, () => {
				this.update();
			});
		}
		if (this._selectionContainer) {
			this._selectionContainer.addEventListener('mousedown', (e) => this._onClick(e));
		}
	}

	private _renderSelections(): void {
		if (this._editor === null || this._selectionContainer === null) {
			return;
		}
		const selections = this._editor.getSelctions();
		const selElements: EditorCursor[] = [];
		for (const sel of selections) {
			const linesData = this._editor.getLines(sel.end.line, 1);
			if (linesData.length === 0) {
				continue;
			}
			const lineContent = linesData[0];
			const left = offsetToColumn(lineContent.rawText, sel.end.offset) * this._letterWidth;
			const top = (sel.end.line - this._firstVisibleLine) * this._lineHeight;
			selElements.push(new EditorCursor(left, top));
		}

		const domElements = selElements.map((el) => el.getDOMElment()).filter(notEmpty);
		this._selectionContainer.replaceChildren(...domElements);
	}

	private _onClick(e: MouseEvent): void {
		if (this._editor === null) {
			return;
		}
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
			this._editor.setSelection(new Selection(line, offset, line, offset));
		} else {
			const lineContent = linesData[0];
			const column = Math.round(x / this._letterWidth);
			const offset = columnToOffset(lineContent.rawText, column);
			this._editor.setSelection(new Selection(line, offset, line, offset));
		}
	}
}
