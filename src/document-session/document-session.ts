import Document from '../document/document';
import { Mode } from '../mode';
import { MODES } from '../modes';
import { NaiveSearch, Search } from '../search';
import TokenizerData from '../tokenizer/tokenizer-data';
import { randomString } from '../utils';

export default class DocumentSession {
	private _id: string;
	private _document: Document;
	private _tokenizerData: TokenizerData;
	private _mode: Mode;
	private _search: Search;

	constructor(
		document: Document,
		mode: Mode | null = null,
		tokenizerData: TokenizerData | null = null,
	) {
		this._id = randomString(10);
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
}
