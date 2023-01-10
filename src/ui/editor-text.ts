import { EventEmitter } from '../events';
import { createDiv } from './dom-utils';
import EditorLineElement from './editor-line-element';
import { Row, rowCompare } from '../document/line';
import EdiotrView from './editor-view';
import { EvFont, EvScroll, EvWrap, TextLayerEvents } from './events';
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
	private _renderedRowsKeys: number[] = [];
	private _renderedRows: Row[] = [];

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
			this.update(true);
		});
		this._view.on(EvSelection.Changed, () => {
			this._updateActiveRows();
		});
		this._view.on(EvDocument.Set, () => {
			this.update(true);
		});
		this._view.on(EvWrap.Changed, () => {
			this.update(true);
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

	public update(forceRenderAll: boolean = false): void {
		this._renderRows(forceRenderAll);
	}

	public measureLetterWidth(): void {
		return this._measureLetterWidth();
	}

	public _updateActiveRows(): void {
		if (this._textContainer == null) {
			return;
		}
		const activeRows = this._session.getActiveRowsNumbers(
			this._firstVisibleLine,
			this._visibleLinesCount,
		);

		for (let i = 0; i < this._visibleRows.length; i++) {
			const row = this._visibleRows[i];
			row.setActive(activeRows.has(this._firstVisibleLine + i));
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

	private _renderRows(forceRenderAll: boolean = false): void {
		if (this._textContainer === null) {
			return;
		}
		const activeRows = this._session.getActiveRowsNumbers(
			this._firstVisibleLine,
			this._visibleLinesCount,
		);
		const rows = this._session.reader.getRows(this._firstVisibleLine, this._visibleLinesCount);
		const rowsNumbers = rows.map((row) => row.number);
		let removed: number[] = [];
		if (forceRenderAll) {
			removed = this._visibleRows.map((el, i) => i);
		} else {
			for (let i = 0; i < this._renderedRowsKeys.length; i++) {
				if (!rowsNumbers.includes(this._renderedRowsKeys[i])) {
					removed.push(i);
				}
			}
		}

		const rRemoved = removed.reverse();
		for (const toRemove of rRemoved) {
			const row = this._visibleRows[toRemove];
			let node = null;
			try {
				node = row.getNode();
			} catch {
				continue;
			}
			if (node === null) {
				continue;
			}
			if (removed.includes(toRemove)) {
				this._textContainer.removeChild(node);
			}
			row.unmount();
			this._renderedRows.splice(toRemove, 1);
			this._renderedRowsKeys.splice(toRemove, 1);
			this._visibleRows.splice(toRemove, 1);
		}

		let i = 0;
		for (const row of rows) {
			const rowNumber = row.number;
			const ind = this._renderedRowsKeys.indexOf(rowNumber);

			if (ind !== -1) {
				if (rowCompare(row, this._renderedRows[ind])) {
					i++;
					continue;
				}
				this._visibleRows[ind].setData(row);
				this._visibleRows[ind].setSchema(this._highlighterSchema);
				this._visibleRows[ind].setActive(activeRows.has(row.number));
				this._visibleRows[ind].render();
			} else {
				const rowElement = this._renderRow(row, row.line === this._activeLineNumber);
				rowElement.setActive(activeRows.has(row.number));
				const domElement = rowElement.getNode();
				if (domElement === null) {
					i++;
					continue;
				}
				let nextNode = null;
				if (i < this._visibleRows.length) {
					nextNode = this._visibleRows[i].getNode();
					this._textContainer.insertBefore(domElement, nextNode);
				} else {
					this._textContainer.append(domElement);
				}
				this._visibleRows.splice(i, 0, rowElement);
			}
			i++;
		}

		this._renderedRows = rows;
		this._renderedRowsKeys = rows.map((row) => row.number);
	}

	private _renderRow(row: Row, active: boolean): EditorLineElement {
		return new EditorLineElement(row, active, this._highlighterSchema);
	}
}

export default TextLayer;
