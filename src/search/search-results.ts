import { Range } from '../selection';
import { pointCompare } from '../selection/utils';
import { MAX_SEARCH_RESULTS } from './config';
import SearchResult from './search-result';

export interface SearchLineResults {
	lineNumber: number;
	matches: number[];
	count: number;
	activeSearchRes: number;
}

export default class SerachResults {
	private _results: Range[] = [];
	private _searchPhrase: string = '';
	private _activeSearchRes: number = 0;
	public caseSensitive: boolean = false;
	public searchInSelection: boolean = false;
	public maxResultsCount: number = MAX_SEARCH_RESULTS;

	private get _totalResults(): number {
		return this._results.length;
	}

	public get results(): Range[] {
		return this._results;
	}

	public get matchCount(): number {
		return this._totalResults;
	}

	public get activeSearchResultNumber(): number {
		return this._activeSearchRes;
	}

	public set activeSearchResultNumber(value: number) {
		this._activeSearchRes = value;
	}

	public nextResult(): number {
		if (this._totalResults < 1) {
			return -1;
		}
		this._activeSearchRes++;
		if (!(this._activeSearchRes < this._results.length)) {
			this._activeSearchRes = 0;
		}
		return this._activeSearchRes;
	}

	public prevResult(): number {
		if (this._totalResults < 1) {
			return -1;
		}
		this._activeSearchRes--;
		if (this._activeSearchRes < 0) {
			this._activeSearchRes = this._results.length - 1;
		}
		return this._activeSearchRes;
	}

	public getLineResutls(lineNumber: number): SearchResult[] {
		const results: SearchResult[] = [];
		for (let i = 0; i < this._results.length; i++) {
			const res = this._results[i];
			if (res.start.line <= lineNumber && res.end.line >= lineNumber) {
				results.push({ ...res, isActive: i === this._activeSearchRes });
			}
		}
		return results;
	}

	public getLinesResutls(lineNumber: number, linesCount: number): SearchResult[] {
		const firstLineIndex = lineNumber;
		const lastLineIndex = lineNumber + linesCount;
		const results: SearchResult[] = [];
		for (let i = 0; i < this._results.length; i++) {
			const res = this._results[i];
			if (
				(res.start.line >= firstLineIndex && res.start.line <= lastLineIndex) ||
				(res.end.line >= firstLineIndex && res.end.line <= lastLineIndex)
			) {
				results.push({ ...res, isActive: i === this._activeSearchRes });
			}
		}
		return results;
	}

	public clearLineResults(lineNumber: number): void {
		let i = this._results.length;

		while (i--) {
			const res = this._results[i];
			if (res.start.line <= lineNumber && res.end.line >= lineNumber) {
				this._results.splice(i, 1);
			}
		}
	}

	public clearLinesResults(lineNumber: number, linesCount: number): void {
		const firstLineIndex = lineNumber;
		const lastLineIndex = lineNumber + linesCount - 1;
		let i = this._results.length;

		while (i--) {
			const res = this._results[i];
			if (
				(res.start.line >= firstLineIndex && res.start.line <= lastLineIndex) ||
				(res.end.line >= firstLineIndex && res.end.line <= lastLineIndex)
			) {
				this._results.splice(i, 1);
			}
		}
	}

	public addResult(res: Range): number {
		if (this._results.length + 1 > this.maxResultsCount) {
			return 0;
		}
		let i = 0;
		for (i = 0; i < this._results.length; i++) {
			const r = this._results[i];
			if (pointCompare(res.start, r.start) === 2) {
				break;
			}
		}
		this._results.splice(i, 0, res);
		return 1;
	}

	public addResults(res: Range[]): number {
		let l = res.length;
		if (this._results.length + res.length > this.maxResultsCount) {
			l = this.maxResultsCount - this._results.length;
		}
		for (const r of res.slice(0, l)) {
			this.addResult(r);
		}
		return l;
	}

	public getActiveSearchResPosition(): SearchResult {
		const lineRes = this._results[this._activeSearchRes];
		const res = new SearchResult(
			lineRes.start.line,
			lineRes.start.offset,
			lineRes.end.line,
			lineRes.end.offset,
		);
		res.isActive = true;
		return res;
	}

	public clearResults(): void {
		this._searchPhrase = '';
		this._results = [];
		this._activeSearchRes = 0;
	}

	public get phrase(): string {
		return this._searchPhrase;
	}

	public set phrase(value: string) {
		this._searchPhrase = value;
	}

	public applyLinesDelta(lineNumber: number, linesCount: number): void {
		for (const res of this._results) {
			if (res.start.line >= lineNumber) {
				res.start.line += linesCount;
			}
			if (res.end.line >= lineNumber) {
				res.end.line += linesCount;
			}
		}
	}
}
