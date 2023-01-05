import { EventEmitter } from '../events';
import { createDiv } from './dom-utils';
import EditorLineElement from './editor-line-element';
import { Row } from '../document/line';
import EdiotrView from './editor-view';
import { EvFont, EvScroll, TextLayerEvents } from './events';
import { notEmpty } from '../utils';
import { CSSClasses } from '../styles/css';
import { HighlighterSchema } from '../highlighter';
import EditSession from '../edit-session/edit-session';
import { EvDocument, EvTokenizer } from '../document-session/events';
import { EvSelection } from '../edit-session/events';

class TextLayer extends EventEmitter<TextLayerEvents> {
	private _view: EdiotrView;
	private _mountPoint: HTMLElement | null = null;
	private _textContainer: HTMLDivElement | null = null;
	private _firstVisibleLine: number = 0;
	private _visibleLinesCount: number = 20;
	private _visibleRows: EditorLineElement[] = [];
	private _activeLineNumber: number = 0;
	private _hoveredLineNumber: number = 0;
	private _lineHeight: number = 20;
	private _letterWidth: number = 0;
	private _rightPadding: number = 20;

	constructor(view: EdiotrView) {
		super();
		this._view = view;
		this._mountPoint = view.getDOMElement();
		this._createTextContainer();
		this._initEventListeners();
		this._measureLetterWidth();
	}

	private get _session(): EditSession {
		return this._view.session;
	}

	private get _highlighterSchema(): HighlighterSchema {
		return this._session.highlightingSchema;
	}

	public updateSessionRowWidth(): void {
		if (this._textContainer === null) {
			return;
		}
		const rect = this._textContainer.getBoundingClientRect();
		const padding = this._rightPadding;
		const visibleChars = Math.floor((rect.width - padding) / this._letterWidth);
		this._session.setVisibleColumnsCount(visibleChars);
	}

	private _initEventListeners(): void {
		this._view.on(EvScroll.Changed, (e) => {
			this.setFirstVisibleLine(e.firstVisibleRow);
			this.update();
		});
		this._view.on(EvDocument.Edited, () => {
			this.update();
		});
		this._view.on(EvTokenizer.Finished, () => {
			this.update();
		});
		this._view.on(EvSelection.Changed, () => {
			this._updateActiveRows();
		});
		this._view.on(EvDocument.Set, () => {
			this.update();
		});
	}

	private _createTextContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		this._textContainer = createDiv(CSSClasses.TEXT_LAYER);
		this._mountPoint.appendChild(this._textContainer);
		this._textContainer.style.gridArea = '1/2/2/3';
	}

	public setFirstVisibleLine(firstLine: number): void {
		this._firstVisibleLine = firstLine;
	}

	public setVisibleLinesCount(linesCount: number): void {
		this._visibleLinesCount = linesCount;
	}

	public update(): void {
		this._renderRows();
	}

	public measureLetterWidth(): void {
		return this._measureLetterWidth();
	}

	public _updateActiveRows(): void {
		if (this._textContainer == null) {
			return;
		}
		const rows = this._session.reader.getRows(this._firstVisibleLine, this._visibleLinesCount);
		const lineNumbers = rows.map((row) => row.line);
		const firstVisibleLine = Math.min(...lineNumbers);
		const lastVisibleLine = Math.max(...lineNumbers);
		const activeLines = this._session.getActiveLinesNumbers(
			firstVisibleLine,
			lastVisibleLine - firstVisibleLine + 1,
		);
		if (this._visibleRows.length !== rows.length) {
			return;
		}
		for (const row of this._visibleRows) {
			row.setActive(activeLines.has(row.line));
		}
	}

	private _measureLetterWidth(): void {
		if (this._textContainer === null) {
			return;
		}
		const testDiv = createDiv('');
		testDiv.style.padding = '0';
		testDiv.style.margin = '0';
		testDiv.style.width = 'fit-content';
		testDiv.textContent = 'qwertyuiopASDFGHJKLX';
		this._textContainer.appendChild(testDiv);
		this._letterWidth = testDiv.offsetWidth / 20;
		this._textContainer.removeChild(testDiv);
		this._session.letterWidth = this._letterWidth;

		this.emit(EvFont.LetterWidth, { width: this._letterWidth });
	}

	private _renderRows(): void {
		if (this._textContainer === null) {
			return;
		}
		const rows = this._session.reader.getRows(this._firstVisibleLine, this._visibleLinesCount);
		const lineNumbers = rows.map((row) => row.line);
		const firstVisibleLine = Math.min(...lineNumbers);
		const lastVisibleLine = Math.max(...lineNumbers);
		const activeLines = this._session.getActiveLinesNumbers(
			firstVisibleLine,
			lastVisibleLine - firstVisibleLine + 1,
		);

		this._visibleRows = [];
		let rowNumber = 0;
		for (const row of rows) {
			this._renderRow(this._visibleRows, row, row.line === this._activeLineNumber);
			this._visibleRows[rowNumber].setActive(activeLines.has(row.line));
			rowNumber++;
		}

		const domElements = this._visibleRows.map((el) => el.getNode()).filter(notEmpty);
		this._textContainer.replaceChildren(...domElements);
	}

	private _renderRow(parent: EditorLineElement[], row: Row, active: boolean): void {
		const lineElement = new EditorLineElement(row, active, this._highlighterSchema);
		parent.push(lineElement);
	}
}

export default TextLayer;
