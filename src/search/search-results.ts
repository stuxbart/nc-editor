export interface SearchLineResults {
	lineNumber: number;
	matches: number[];
	count: number;
	activeSearchRes: number;
}

export default class SerachResults {
	private _results: SearchLineResults[] = [];
	private _totalResults: number = 0;
	private _searchPhrase: string = '';
	private _activeSearchRes: [number, number] = [0, 0]; // line number, number in line

	public get results(): SearchLineResults[] {
		return this._results;
	}

	public get matchCount(): number {
		return this._totalResults;
	}

	public set matchCount(value) {
		this._totalResults = value;
	}

	public get activeSearchResult(): [number, number] {
		return this._activeSearchRes;
	}

	public set activeSearchResult(value: [number, number]) {
		this._activeSearchRes = value;
	}

	public nextResult(): [number, number] {
		const currentLineRes = this._results[this._activeSearchRes[0]];
		if (this._activeSearchRes[1] + 1 < currentLineRes.lineNumber) {
			this._activeSearchRes[1] += 1;
		} else {
			if (this._activeSearchRes[0] + 1 < this._results.length) {
				this._activeSearchRes[0] += 1;
			} else {
				this._activeSearchRes[0] = 0;
			}
			this._activeSearchRes[1] = 0;
		}
		return this._activeSearchRes;
	}

	public getLineResutls(lineNumber: number): SearchLineResults {
		const lineResIndex = this._results.findIndex((res) => res.lineNumber === lineNumber);
		if (lineResIndex === -1) {
			return { lineNumber: lineNumber, matches: [], count: 0, activeSearchRes: -1 };
		}
		const lineRes = this._results[lineResIndex];
		if (this._activeSearchRes[0] === lineResIndex) {
			lineRes.activeSearchRes = this._activeSearchRes[1];
		}
		return lineRes;
	}

	public getLinesResutls(lineNumber: number, linesCount: number): SearchLineResults[] {
		// todo
		const linesResults: SearchLineResults[] = [];
		for (let i = lineNumber; i < lineNumber + linesCount; i++) {
			linesResults.push(this.getLineResutls(i));
		}
		return linesResults;
	}

	public setLineResults(lineNumber: number, results: number[], clearPrev: boolean = false): void {
		if (results.length === 0) {
			return;
		}
		const newRes: SearchLineResults = {
			lineNumber: lineNumber,
			matches: results,
			count: results.length,
			activeSearchRes: -1,
		};
		if (clearPrev) {
			const i = this._results.findIndex((res) => res.lineNumber === lineNumber);
			if (i > -1) {
				this._results[i] = newRes;
				this._totalResults -= this._results[i].count;
				this._totalResults += newRes.count;
				return;
			}
		}
		this._totalResults += newRes.count;
		this._results.push(newRes);
	}

	public clearResults(): void {
		this._totalResults = 0;
		this._searchPhrase = '';
		this._results = [];
		this._activeSearchRes = [0, 0];
	}

	public get phrase(): string {
		return this._searchPhrase;
	}

	public set phrase(value: string) {
		this._searchPhrase = value;
	}
}
