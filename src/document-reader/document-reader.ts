import Line, { Row } from '../document/line';
import SearchResult from '../search/search-result';
import Reader from './reader';

export default class DocumentReader extends Reader {
	public getLines(firstLine: number, count: number): Line[] {
		const document = this._document;
		if (firstLine >= document.linesCount) {
			return [];
		}
		if (firstLine + count > document.linesCount) {
			count = document.linesCount - firstLine;
		}
		const tokenizerData = this._documentSession.tokenizerData;
		const searchResults = this._editSession.searchResults;
		const rawLines = document.getLines(firstLine, count);
		const linesTokens = tokenizerData.getLinesTokens(firstLine, count);
		const linesSearchResults = searchResults.getLinesResutls(firstLine, count);
		const lines: Line[] = [];

		for (let i = 0; i < count; i++) {
			const lineNumber = firstLine + i;
			const lineSearchResults: SearchResult[] = [];
			for (const res of linesSearchResults) {
				if (!(res.start.line <= lineNumber && res.end.line >= lineNumber)) {
					continue;
				}
				let startOffset = 0;
				let endOffset = rawLines[i].length;
				if (lineNumber === res.start.line) {
					startOffset = res.start.offset;
				}
				if (lineNumber === res.end.line) {
					endOffset = res.end.offset;
				}
				const lineRes = new SearchResult(lineNumber, startOffset, lineNumber, endOffset);
				lineRes.isActive = res.isActive;
				lineSearchResults.push(lineRes);
			}
			lines.push({
				rawText: rawLines[i],
				tokens: linesTokens[i],
				lineBreaks: [],
				searchResults: lineSearchResults,
			});
		}
		return lines;
	}

	public getRows(firstRow: number, count: number): Row[] {
		const lines = this.getLines(firstRow, count);
		const rows: Row[] = [];
		let i = 0;
		for (const line of lines) {
			rows.push({
				line: firstRow + i,
				ord: 0,
				offset: 0,
				text: line.rawText,
				tokens: line.tokens,
				searchResults: line.searchResults,
			});
			i++;
		}
		return rows;
	}

	public getFirstLine(): Line | null {
		const document = this._document;
		const tokenizerData = this._documentSession.tokenizerData;
		const firstLine = document.getFirstLine();
		const line = new Line(firstLine, tokenizerData.getLineTokens(0), []);
		return line;
	}

	public getLastLine(): Line | null {
		const document = this._document;
		const tokenizerData = this._documentSession.tokenizerData;
		const lastLine = document.getLastLine();
		const line = new Line(lastLine, tokenizerData.getLineTokens(document.linesCount - 1), []);
		return line;
	}

	public getTotalLinesCount(): number {
		return this._document.linesCount;
	}

	public getTotalRowsCount(): number {
		if (this._editSession.isWrapEnabled) {
			return this._editSession.wrapData.rowsCount;
		} else {
			return this._document.linesCount;
		}
	}

	public getFirstRowForLine(lineNumber: number): number {
		if (this._editSession.isWrapEnabled) {
			return this._editSession.wrapData.getFirstRowForLine(lineNumber);
		} else {
			return lineNumber;
		}
	}

	public getSelectedText(): string {
		let text = '';
		for (const sel of this._editSession.selections.getSelections()) {
			text += this._document.getText(sel);
		}
		return text;
	}
}
