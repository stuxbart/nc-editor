import { Document } from '../document';
import SelectionManager from '../selection/selection-manager';
import TokenizerData from '../tokenizer/tokenizer-data';

export default class EditorSession {
	private _document: Document;
	private _tokenizerData: TokenizerData;
	private _selections: SelectionManager;

	constructor(
		document: Document,
		tokenizerData: TokenizerData | null = null,
		selections: SelectionManager | null = null,
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
}
