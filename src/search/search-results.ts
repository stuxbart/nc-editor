import { Point } from '../selection';

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
	public caseSensitive: boolean = false;

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
		if (this._totalResults < 1) {
			return [-1, -1];
		}
		const currentLineRes = this._results[this._activeSearchRes[0]];
		currentLineRes.activeSearchRes = -1;
		if (this._activeSearchRes[1] + 1 < currentLineRes.count) {
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

	public prevResult(): [number, number] {
		if (this._totalResults < 1) {
			return [-1, -1];
		}
		const currentLineRes = this._results[this._activeSearchRes[0]];
		currentLineRes.activeSearchRes = -1;
		if (this._activeSearchRes[1] - 1 > -1) {
			this._activeSearchRes[1] -= 1;
		} else {
			if (this._activeSearchRes[0] - 1 > -1) {
				this._activeSearchRes[0] -= 1;
			} else {
				this._activeSearchRes[0] = this._results.length - 1;
			}
			this._activeSearchRes[1] = this._results[this._activeSearchRes[0]].count - 1;
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
		if (results.length === 0 && !clearPrev) {
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
			const isActive = i === this._activeSearchRes[0];
			if (i > -1) {
				this._totalResults -= this._results[i].count;
				this._results[i] = newRes;
				this._totalResults += newRes.count;
				if (isActive && results.length <= this._activeSearchRes[1]) {
					this.nextResult();
				}
				return;
			}
		}
		this._totalResults += newRes.count;
		this._results.push(newRes);
	}

	public getActiveSearchResPosition(): Point {
		const lineRes = this._results[this._activeSearchRes[0]];
		return { line: lineRes.lineNumber, offset: lineRes.matches[this._activeSearchRes[1]] };
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
