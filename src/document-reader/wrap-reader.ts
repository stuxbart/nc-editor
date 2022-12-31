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
		const linesSearchResults = searchResults.getLinesResutls(firstLine, count);
		const lines: Line[] = [];

		for (let i = 0; i < count; i++) {
			lines.push({
				rawText: rawLines[i],
				tokens: linesTokens[i],
				lineBreaks: [],
				searchResults: linesSearchResults[i].matches,
				activeSearchRes: linesSearchResults[i].activeSearchRes,
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
		const rawLines = document.getLines(firstLineIndex, linesCount);
		const linesTokens = tokenizerData.getLinesTokens(firstLineIndex, linesCount);
		const linesSearchResults = searchResults.getLinesResutls(firstLineIndex, linesCount);
		const rows: Row[] = [];
		let off = 0;
		let prevLineNumber = -1;

		if (rowsWrapData.length > 0 && rowsWrapData[0].ord !== 0) {
			const prevRowData = wrapData.getRows(firstRow - 1, 1)[0];
			off = prevRowData.offset;
			prevLineNumber = prevRowData.line;
		}

		for (const row of rowsWrapData) {
			const lineIndex = row.line - firstLineIndex;
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

			const lineSearchResults: number[] = linesSearchResults[lineIndex].matches;
			const rowSearchResults: number[] = [];
			let rowActiveSearchRes = -1;

			for (let j = 0; j < lineSearchResults.length; j++) {
				const searchResult = lineSearchResults[j];

				if (searchResult < off) {
					continue;
				}
				if (searchResult < row.offset) {
					rowSearchResults.push(searchResult - off);
					if (j === linesSearchResults[lineIndex].activeSearchRes) {
						rowActiveSearchRes = j;
					}
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
				activeSearchRes: rowActiveSearchRes,
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
