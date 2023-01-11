import Line, { Row } from '../document/line';
import SearchResult from '../search/search-result';
import { Point } from '../selection';
import { Token } from '../tokenizer';
import Reader from './reader';

export default class WrapReader extends Reader {
	public getLines(firstLine: number, count: number): Line[] {
		const document = this._document;
		if (firstLine >= document.linesCount) {
			return [];
		}
		if (firstLine + count >= document.linesCount) {
			count = document.linesCount - firstLine;
		}
		const tokenizerData = this._documentSession.tokenizerData;
		const searchResults = this._editSession.searchResults;
		const rawLines = document.getLines(firstLine, count);
		const linesTokens: Token[][] = tokenizerData.getLinesTokens(firstLine, count);
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
				searchResults: [],
			});
		}
		return lines;
	}

	public getRows(firstRow: number, count: number): Row[] {
		const document = this._document;
		const tokenizerData = this._documentSession.tokenizerData;
		const searchResults = this._editSession.searchResults;
		const wrapData = this._editSession.wrapData;
		if (firstRow > wrapData.rowsCount) {
			return [];
		}
		if (firstRow + count > wrapData.rowsCount) {
			count = wrapData.rowsCount - firstRow;
		}

		const rowsWrapData = wrapData.getRows(firstRow, count);
		const lineNumbers = rowsWrapData.map((w) => w.line);
		const firstLineIndex = Math.min(...lineNumbers);
		const lastLineIndex = Math.max(...lineNumbers);
		const linesCount = lastLineIndex - firstLineIndex + 1;
		let rawLines: string[] = [];
		if (firstLineIndex < document.linesCount) {
			if (firstLineIndex + linesCount < document.linesCount) {
				rawLines = document.getLines(firstLineIndex, linesCount);
			} else {
				rawLines = document.getLines(firstLineIndex, document.linesCount - firstLineIndex);
			}
		}
		const linesTokens = tokenizerData.getLinesTokens(firstLineIndex, linesCount);
		const linesSearchResults = searchResults.getLinesResutls(firstLineIndex, linesCount);
		const rows: Row[] = [];
		let off = 0;
		let prevLineNumber = -1;
		let i = 0;

		if (rowsWrapData.length > 0 && rowsWrapData[0].ord !== 0) {
			const prevRowData = wrapData.getRows(firstRow - 1, 1)[0];
			off = prevRowData.offset;
			prevLineNumber = prevRowData.line;
		}

		for (const row of rowsWrapData) {
			const lineIndex = row.line - firstLineIndex;
			const lineNumber = row.line;
			if (rawLines.length < lineIndex) {
				break;
			}
			if (rawLines.length <= lineIndex) {
				break;
			}
			if (prevLineNumber !== row.line) {
				off = 0;
			}
			prevLineNumber = row.line;
			const line = rawLines[lineIndex];
			const lineTokens: Token[] = linesTokens[lineIndex];
			const rowTokens: Token[] = [];

			for (let i = 0; i < lineTokens.length; i++) {
				const token = lineTokens[i];
				if (token.startIndex < off) {
					if (i + 1 === lineTokens.length) {
						continue;
					}
					const nextToken = lineTokens[i + 1];
					if (nextToken.startIndex <= off) {
						continue;
					}
					rowTokens.push({ startIndex: 0, type: token.type });
				} else if (token.startIndex < row.offset) {
					rowTokens.push({ startIndex: token.startIndex - off, type: token.type });
				} else {
					break;
				}
			}

			const lineSearchResults: SearchResult[] = [];
			for (const res of linesSearchResults) {
				if (!(res.start.line <= lineNumber && res.end.line >= lineNumber)) {
					continue;
				}
				let startOffset = 0;
				let endOffset = line.length;
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

			const rowSearchResults: SearchResult[] = [];

			for (const res of lineSearchResults) {
				if (
					(res.start.offset <= off && res.end.offset <= off) ||
					(res.start.offset >= row.offset && res.end.offset >= row.offset)
				) {
					continue;
				}
				const startOffset = Math.max(res.start.offset, off);
				const endOffset = Math.min(res.end.offset, row.offset);

				const rowRes = new SearchResult(
					lineNumber,
					startOffset - off,
					lineNumber,
					endOffset - off,
				);
				rowRes.isActive = res.isActive;
				rowSearchResults.push(rowRes);
			}

			rows.push({
				number: firstRow + i,
				line: row.line,
				ord: row.ord,
				offset: off,
				text: line.slice(off, row.offset),
				tokens: rowTokens,
				searchResults: rowSearchResults,
			});

			off = row.offset;
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

	public getRowAtPosition(pos: Point): Row | null {
		let rowNumber = this._editSession.wrapData.getRowNumberAtPosition(pos);
		if (rowNumber === -1) {
			rowNumber = pos.line;
		}
		const rows = this.getRows(rowNumber, 1);
		if (rows.length === 0) {
			return null;
		}
		const row = rows[0];
		return row;
	}
}
