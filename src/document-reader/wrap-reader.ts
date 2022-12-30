import Line, { Row } from '../document/line';
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
		const lines: Line[] = [];

		for (let i = 0; i < count; i++) {
			lines.push({
				rawText: rawLines[i],
				tokens: linesTokens[i],
				lineBreaks: [],
				searchResults: searchResults.getLineResutls(firstLine + i).matches,
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
		const rawLines = document.getLines(firstLineIndex, lastLineIndex - firstLineIndex + 1);
		const linesTokens: Token[][] = tokenizerData.getLinesTokens(
			firstLineIndex,
			lastLineIndex - firstLineIndex + 1,
		);

		const rows: Row[] = [];
		let off = 0;
		let prevLineNumber = -1;

		if (rowsWrapData.length > 0 && rowsWrapData[0].ord !== 0) {
			const prevRowData = wrapData.getRows(firstRow - 1, 1)[0];
			off = prevRowData.offset;
			prevLineNumber = prevRowData.line;
		}

		for (const row of rowsWrapData) {
			if (rawLines.length < row.line - firstLineIndex) {
				break;
			}
			if (rawLines.length <= row.line - firstLineIndex) {
				break;
			}
			if (prevLineNumber !== row.line) {
				off = 0;
			}
			prevLineNumber = row.line;
			const line = rawLines[row.line - firstLineIndex];
			const lineTokens: Token[] = linesTokens[row.line - firstLineIndex];
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

			const lineSearchResults: number[] = searchResults.getLineResutls(row.line).matches;
			const rowSearchResults: number[] = [];

			for (const searchResult of lineSearchResults) {
				if (searchResult < off) {
					continue;
				}
				if (searchResult < row.offset) {
					rowSearchResults.push(searchResult - off);
				} else {
					break;
				}
			}

			rows.push({
				line: row.line,
				ord: row.ord,
				offset: off,
				text: line.slice(off, row.offset),
				tokens: rowTokens,
				searchResults: rowSearchResults,
			});

			off = row.offset;
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
