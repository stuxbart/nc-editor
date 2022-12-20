import Document from '../document/document';
import { EventEmitter } from '../events';
import { Mode } from '../mode';
import { getMode, MODES } from '../modes';
import { NaiveSearch, Search } from '../search';
import TokenizerData from '../tokenizer/tokenizer-data';
import { randomId } from '../utils';
import { DocumentSessionEvents, EvDocument, EvTokenizer } from './events';

export default class DocumentSession extends EventEmitter<DocumentSessionEvents> {
	private _id: string;
	private _document: Document;
	private _tokenizerData: TokenizerData;
	private _mode: Mode;
	private _search: Search;

	private _updateTokensAfterEdit: boolean = true;
	private _shouldEmitLinesCountChangeEvent: boolean = true;
	private _shouldEmitEditEvent: boolean = true;

	constructor(
		document: Document,
		mode: Mode | null = null,
		tokenizerData: TokenizerData | null = null,
	) {
		super();
		this._id = randomId(10);
		this._document = document;

		if (mode) {
			this._mode = mode;
		} else {
			this._mode = MODES.default;
		}

		if (tokenizerData === null) {
			this._tokenizerData = new TokenizerData();
		} else {
			this._tokenizerData = tokenizerData;
		}

		this._search = new NaiveSearch();
	}

	public get id(): string {
		return this._id;
	}

	public get document(): Document {
		return this._document;
	}

	public get tokenizerData(): TokenizerData {
		return this._tokenizerData;
	}

	public get mode(): Mode {
		return this._mode;
	}

	public set mode(value: Mode) {
		this._mode = value;
	}

	public get search(): Search {
		return this._search;
	}

	public get modeName(): string {
		return this._mode.name;
	}

	public updateLinesTokens(firstLine: number): void {
		if (this._updateTokensAfterEdit) {
			this._mode.tokenizer.updateTokens(this._document, this._tokenizerData, firstLine);
		}
	}

	public setMode(modeName: string): void {
		const mode = getMode(modeName);
		this._mode = mode;
		this.tokenize();
	}

	public emitLinesCountChanged(lineDiff: number): void {
		if (this._shouldEmitLinesCountChangeEvent && lineDiff !== 0) {
			this.emit(EvDocument.LinesCount, {
				linesCount: this._document.linesCount,
			});
		}
	}

	public emitEditEvent(): void {
		if (this._shouldEmitEditEvent) {
			this.emit(EvDocument.Edited, undefined);
		}
	}

	public tokenize(): void {
		const document = this._document;
		this.mode.tokenizer.tokenize(document, this._tokenizerData);
		this.emit(EvTokenizer.Finished, undefined);
	}

	public enableTokenization(): void {
		this._updateTokensAfterEdit = true;
	}

	public disableTokenization(): void {
		this._updateTokensAfterEdit = false;
	}

	public enableEditEvent(): void {
		this._shouldEmitEditEvent = true;
	}

	public disableEditEvent(): void {
		this._shouldEmitEditEvent = false;
	}

	public enableLinesChangedEvent(): void {
		this._shouldEmitLinesCountChangeEvent = true;
	}

	public disableLinesChangedEvent(): void {
		this._shouldEmitLinesCountChangeEvent = false;
	}

	public emitInitEvents(): void {
		const document = this._document;
		this.emit(EvDocument.LinesCount, {
			linesCount: document.linesCount,
		});
		this.emit(EvTokenizer.Finished, undefined);
	}
}
