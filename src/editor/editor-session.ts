import { Document } from '../document';
import { Mode } from '../mode';
import { MODES } from '../modes';
import SelectionManager from '../selection/selection-manager';
import TokenizerData from '../tokenizer/tokenizer-data';

export default class EditorSession {
	private _document: Document;
	private _tokenizerData: TokenizerData;
	private _selections: SelectionManager;
	private _mode: Mode;

	constructor(
		document: Document,
		tokenizerData: TokenizerData | null = null,
		selections: SelectionManager | null = null,
		mode: Mode | null = null,
	) {
		this._document = document;
		if (tokenizerData === null) {
			this._tokenizerData = new TokenizerData();
		} else {
			this._tokenizerData = tokenizerData;
		}
		if (selections === null) {
			this._selections = new SelectionManager(document);
		} else {
			this._selections = selections;
		}
		if (mode === null) {
			this._mode = MODES.default;
		} else {
			this._mode = mode;
		}
	}

	public get document(): Document {
		return this._document;
	}

	public get tokenizerData(): TokenizerData {
		return this._tokenizerData;
	}

	public get selections(): SelectionManager {
		return this._selections;
	}

	public get mode(): Mode {
		return this._mode;
	}

	public set mode(value: Mode) {
		this._mode = value;
	}
}
