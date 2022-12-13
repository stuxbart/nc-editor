import { Document } from '../document';
import { Mode } from '../mode';
import { MODES } from '../modes';
import { NaiveSearch, Search } from '../search';
import SerachResults from '../search/search-results';
import SelectionManager from '../selection/selection-manager';
import TokenizerData from '../tokenizer/tokenizer-data';

export default class EditorSession {
	private _document: Document;
	private _tokenizerData: TokenizerData;
	private _selections: SelectionManager;
	private _mode: Mode;
	private _searchResults: SerachResults;
	private _search: Search;

	constructor(
		document: Document,
		tokenizerData: TokenizerData | null = null,
		selections: SelectionManager | null = null,
		mode: Mode | null = null,
		searchResults: SerachResults | null = null,
		search: Search | null = null,
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
		if (searchResults === null) {
			this._searchResults = new SerachResults();
		} else {
			this._searchResults = searchResults;
		}
		if (search === null) {
			this._search = new NaiveSearch();
		} else {
			this._search = search;
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

	public get searchResults(): SerachResults {
		return this._searchResults;
	}

	public get search(): Search {
		return this._search;
	}
}
