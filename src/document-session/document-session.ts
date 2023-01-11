import DocumentHistory from '../document-history/document-history';
import Document from '../document/document';
import { EventEmitter } from '../events';
import { Mode } from '../mode';
import { getMode, MODES } from '../modes';
import { getLineIndent } from '../text-utils';
import TokenizerData from '../tokenizer/tokenizer-data';
import { randomId } from '../utils';
import { DocumentSessionEvents, EvDocument, EvTokenizer } from './events';
import { IndentType } from './indent-type';

export default class DocumentSession extends EventEmitter<DocumentSessionEvents> {
	private _id: string;
	private _document: Document;
	private _tokenizerData: TokenizerData;
	private _mode: Mode;

	private _documentHistory: DocumentHistory;

	private _updateTokensAfterEdit: boolean = true;
	private _shouldEmitLinesCountChangeEvent: boolean = true;
	private _shouldEmitEditEvent: boolean = true;
	private _indentType: IndentType = IndentType.TABS;
	private _indentSize: number = 4;

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

		this._documentHistory = new DocumentHistory(this);
		this._detectTextIndents();
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

	public get modeName(): string {
		return this._mode.name;
	}

	public get history(): DocumentHistory {
		return this._documentHistory;
	}

	public get indentType(): IndentType {
		return this._indentType;
	}

	public get indentSize(): number {
		return this._indentSize;
	}

	public updateLinesTokens(firstLine: number): void {
		if (this._updateTokensAfterEdit) {
			this._mode.tokenizer.updateTokens(this._document, this._tokenizerData, firstLine);
			if (this._document.linesCount < firstLine + 1) {
				this._mode.tokenizer.updateTokens(
					this._document,
					this._tokenizerData,
					firstLine + 1,
				);
			}
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
		if (!this._updateTokensAfterEdit) {
			return;
		}
		const document = this._document;
		this.mode.tokenizer.tokenize(document, this._tokenizerData);
		this.emit(EvTokenizer.Finished, undefined);
	}

	public enableTokenization(): void {
		this._updateTokensAfterEdit = true;
		this.tokenize();
	}

	public disableTokenization(): void {
		this._tokenizerData.clear();
		this._updateTokensAfterEdit = false;
		this.emit(EvTokenizer.Finished, undefined);
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

	public undo(): void {
		this._documentHistory.undo();
	}

	public redo(): void {
		this._documentHistory.redo();
	}

	public setIndentType(type: IndentType): void {
		this._indentType = type;
	}

	public setIndentSize(size: number): void {
		this._indentSize = size;
	}

	private _detectTextIndents(): void {
		for (let i = 0; i < this._document.linesCount; i++) {
			const line = this._document.getLine(i);
			const indent = getLineIndent(line);
			if (indent.length < 1) {
				continue;
			}
			if (indent.startsWith(' ')) {
				this._indentSize = indent.length;
				this._indentType = IndentType.SPACES;
				break;
			}
			if (indent.startsWith('\t')) {
				this._indentSize = 4;
				this._indentType = IndentType.TABS;
				break;
			}
		}
	}
}
