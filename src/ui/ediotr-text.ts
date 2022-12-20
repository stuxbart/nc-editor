import { EventEmitter } from '../events';
import { createDiv } from './dom-utils';
import EditorLineElement from './editor-line-element';
import Line from '../document/line';
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
	private _visibleLines: EditorLineElement[] = [];
	private _activeLineNumber: number = 0;
	private _hoveredLineNumber: number = 0;
	private _lineHeight: number = 20;
	private _letterWidth: number = 0;

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

	private _initEventListeners(): void {
		this._view.on(EvScroll.Changed, (e) => {
			this.setFirstVisibleLine(e.firstVisibleLine);
			this.update();
		});

		this._session.documentSession.on(EvDocument.Edited, () => {
			this.update();
		});
		this._session.documentSession.on(EvTokenizer.Finished, () => {
			this.update();
		});
		this._session.on(EvSelection.Changed, () => {
			this._updateActiveLines();
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
		this._renderLines();
	}

	public measureLetterWidth(): void {
		return this._measureLetterWidth();
	}

	private _updateActiveLines(): void {
		if (this._textContainer == null) {
			return;
		}
		const lines = this._session.reader.getLines(
			this._firstVisibleLine,
			this._visibleLinesCount,
		);
		const activeLines = this._session.getActiveLinesNumbers(
			this._firstVisibleLine,
			this._visibleLinesCount,
		);
		if (this._visibleLines.length !== lines.length) {
			return;
		}
		let lineNumber = 0;
		for (const line of this._visibleLines) {
			line.setActive(activeLines.has(this._firstVisibleLine + lineNumber));
			lineNumber++;
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
		this.emit(EvFont.LetterWidth, { width: this._letterWidth });
	}

	private _renderLines(): void {
		if (this._textContainer === null) {
			return;
		}
		const lines = this._session.reader.getLines(
			this._firstVisibleLine,
			this._visibleLinesCount,
		);
		const activeLines = this._session.getActiveLinesNumbers(
			this._firstVisibleLine,
			this._visibleLinesCount,
		);
		if (this._visibleLines.length === lines.length) {
			let lineNumber = 0;
			for (const line of lines) {
				this._visibleLines[lineNumber].setSchema(this._highlighterSchema);
				this._visibleLines[lineNumber].setData(line);
				this._visibleLines[lineNumber].setActive(
					activeLines.has(this._firstVisibleLine + lineNumber),
				);
				this._visibleLines[lineNumber].render();
				lineNumber++;
			}
		} else {
			this._visibleLines = [];
			let lineNumber = 0;
			for (const line of lines) {
				this._renderLine(this._visibleLines, line, this._firstVisibleLine + lineNumber);
				this._visibleLines[lineNumber].setActive(
					activeLines.has(this._firstVisibleLine + lineNumber),
				);
				lineNumber++;
			}
			const domElements = this._visibleLines.map((el) => el.getNode()).filter(notEmpty);
			this._textContainer.replaceChildren(...domElements);
		}
	}

	private _renderLine(parent: EditorLineElement[], line: Line, lineNumber: number): void {
		const lineElement = new EditorLineElement(
			line,
			lineNumber === this._activeLineNumber,
			this._highlighterSchema,
		);
		parent.push(lineElement);
	}
}

export default TextLayer;
