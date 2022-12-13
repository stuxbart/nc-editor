import DocumentNode from '../document/document-node';

export interface SearchLineResults {
	matches: number[];
	count: number;
}

export default class SerachResults {
	private _results: WeakMap<DocumentNode, SearchLineResults>;
	private _totalResults: number = 0;
	private _searchPhrase: string = '';

	constructor() {
		this._results = new WeakMap<DocumentNode, SearchLineResults>();
	}

	public get results(): WeakMap<DocumentNode, SearchLineResults> {
		return this._results;
	}

	public get matchCount(): number {
		return this._totalResults;
	}

	public set matchCount(value) {
		this._totalResults = value;
	}

	public getLineResutls(lineNode: DocumentNode): SearchLineResults {
		const lineResults = this._results.get(lineNode);
		if (lineResults !== undefined) {
			return lineResults;
		}
		return { matches: [], count: 0 };
	}

	public clearResults(): void {
		this._results = new WeakMap<DocumentNode, SearchLineResults>();
	}

	public get phrase(): string {
		return this._searchPhrase;
	}

	public set phrase(value: string) {
		this._searchPhrase = value;
	}
}
