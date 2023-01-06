import { Document } from '../document';
import { Range } from '../selection';
import { Search } from './search';
import SearchResult from './search-result';
import SearchResults from './search-results';

export default class RegExpSearch extends Search {
	public search(phrase: string, document: Document, searchResults: SearchResults): void {
		searchResults.clearResults();
		searchResults.phrase = phrase;
		if (phrase.length === 0) {
			return;
		}
		const regexp = this._compileRegExp(searchResults);
		if (regexp === null) {
			return;
		}
		for (let i = 0; i < document.linesCount; i++) {
			const line = document.getLine(i);
			const lineResults = this._searchInLine(regexp, line, i);
			const added = searchResults.addResults(lineResults);
			if (added !== lineResults.length) {
				break;
			}
		}
	}

	public searchInLines(
		phrase: string,
		document: Document,
		searchResults: SearchResults,
		lines: Set<number>,
	): void {
		searchResults.clearResults();
		searchResults.phrase = phrase;
		if (phrase.length === 0) {
			return;
		}
		const regexp = this._compileRegExp(searchResults);
		if (regexp === null) {
			return;
		}

		for (let i = 0; i < document.linesCount; i++) {
			if (!lines.has(i)) {
				continue;
			}
			const line = document.getLine(i);
			const lineResults = this._searchInLine(regexp, line, i);
			const added = searchResults.addResults(lineResults);
			if (added !== lineResults.length) {
				break;
			}
		}
	}

	public updateLineSearchResults(
		document: Document,
		searchResults: SearchResults,
		lineNumber: number,
	): void {
		if (searchResults.phrase.length === 0) {
			return;
		}
		let line: string = '';
		try {
			line = document.getLine(lineNumber);
		} catch (err) {
			return;
		}
		const regexp = this._compileRegExp(searchResults);
		if (regexp === null) {
			return;
		}
		searchResults.clearLineResults(lineNumber);
		const lineResults = this._searchInLine(regexp, line, lineNumber);
		searchResults.addResults(lineResults);
	}

	public updateLinesSearchResults(
		document: Document,
		searchResults: SearchResults,
		firstLineNumber: number,
		linesCount: number,
	): void {
		if (searchResults.phrase.length === 0) {
			return;
		}
		const regexp = this._compileRegExp(searchResults);
		if (regexp === null) {
			return;
		}
		for (let i = 0; i < linesCount; i++) {
			const lineNumber = firstLineNumber + i;
			let line: string;
			try {
				line = document.getLine(lineNumber);
			} catch (err) {
				return;
			}
			searchResults.clearLineResults(lineNumber);
			const lineResults = this._searchInLine(regexp, line, lineNumber);
			const added = searchResults.addResults(lineResults);
			if (added !== lineResults.length) {
				break;
			}
		}
	}

	public updateNewLinesSearchResults(
		document: Document,
		searchResults: SearchResults,
		firstLineNumber: number,
		newLinesCount: number,
	): void {
		searchResults.applyLinesDelta(firstLineNumber, newLinesCount);
		this.updateLinesSearchResults(document, searchResults, firstLineNumber, newLinesCount);
	}

	public updateRemovedLinesSearchResults(
		document: Document,
		searchResults: SearchResults,
		firstLineNumber: number,
		removedLinesCount: number,
	): void {
		searchResults.applyLinesDelta(firstLineNumber, removedLinesCount);
		this.updateLinesSearchResults(document, searchResults, firstLineNumber, removedLinesCount);
	}

	public findNextOccurence(
		document: Document,
		searchResults: SearchResults,
		startLineNumber: number,
		startOffset: number,
	): SearchResult | null {
		const regexp = this._compileRegExp(searchResults);
		if (regexp === null) {
			return null;
		}
		let res: SearchResult | null = null;
		for (let i = startLineNumber; i < document.linesCount; i++) {
			let line = document.getLine(i);
			if (i === startLineNumber) {
				line = line.substring(startOffset);
			}
			const lineResult = this._findNextInLine(regexp, line, i);
			if (lineResult) {
				let offsetDiff = 0;
				if (lineResult.start.line === startLineNumber) {
					offsetDiff = startOffset;
				}
				res = new SearchResult(
					lineResult.start.line,
					lineResult.start.offset + offsetDiff,
					lineResult.end.line,
					lineResult.end.offset + offsetDiff,
				);
				break;
			}
		}
		return res;
	}

	private _searchInLine(regexp: RegExp, text: string, lineNumber: number): Range[] {
		const matches: Range[] = [];
		const m = text.matchAll(regexp);
		for (const match of m) {
			if (match.index === undefined) {
				break;
			}
			if (match[0].length === 0) {
				continue;
			}
			matches.push(
				new Range(lineNumber, match.index, lineNumber, match.index + match[0].length),
			);
		}
		return matches;
	}

	private _findNextInLine(regexp: RegExp, text: string, lineNumber: number): Range | null {
		let m;
		while ((m = regexp.exec(text)) !== null) {
			if (m[0].length === 0) {
				regexp.lastIndex++;
				continue;
			}
			return new Range(lineNumber, m.index, lineNumber, regexp.lastIndex);
		}
		return null;
	}

	private _compileRegExp(searchResults: SearchResults): RegExp | null {
		try {
			let flags = 'g';
			if (!searchResults.caseSensitive) {
				flags += 'i';
			}
			return new RegExp(searchResults.phrase, flags);
		} catch (err: any) {
			return null;
		}
	}
}
