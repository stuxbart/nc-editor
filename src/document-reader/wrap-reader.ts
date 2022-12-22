import Line, { Row } from '../document/line';
import { Token } from '../tokenizer';
import Reader from './reader';

export default class WrapReader extends Reader {
	public getLines(firstLine: number, count: number): Line[] {
		const document = this._document;
		const tokenizerData = this._documentSession.tokenizerData;
		const searchResults = this._editSession.searchResults;
		const rawLines = document.getLineNodes(firstLine, count);
		const lines: Line[] = [];
		for (const line of rawLines) {
			lines.push({
				rawText: line.text,
				tokens: tokenizerData.getLineTokens(line),
				lineBreaks: [],
				searchResults: searchResults.getLineResutls(line).matches,
			});
		}
		return lines;
	}

	public getRows(firstRow: number, count: number): Row[] {
		const document = this._document;
		const tokenizerData = this._documentSession.tokenizerData;
		const searchResults = this._editSession.searchResults;
		const wrapData = this._editSession.wrapData;

		const rowsWrapData = wrapData.getRows(firstRow, count);
		const lineNumbers = rowsWrapData.map((w) => w.line);
		const firstLineIndex = Math.min(...lineNumbers);
		const lastLineIndex = Math.max(...lineNumbers);
		const rawLines = document.getLineNodes(firstLineIndex, lastLineIndex - firstLineIndex + 1);

		const rows: Row[] = [];
		let off = 0;
		let prevLineNumber = -1;

		if (rowsWrapData[0].ord !== 0) {
			const prevRowData = wrapData.getRows(firstRow - 1, 1)[0];
			off = prevRowData.offset;
			prevLineNumber = prevRowData.line;
		}

		for (const row of rowsWrapData) {
			if (rawLines.length < row.line - firstLineIndex) {
				break;
			}
			if (prevLineNumber !== row.line) {
				off = 0;
			}
			prevLineNumber = row.line;
			const line = rawLines[row.line - firstLineIndex];
			const lineTokens: Token[] = tokenizerData.getLineTokens(line);
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

			const lineSearchResults: number[] = searchResults.getLineResutls(line).matches;
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
				text: line.text.slice(off, row.offset),
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
		const firstLine = document.getFirstLineNode();
		if (firstLine === null) {
			return null;
		}
		const line = new Line(firstLine.text, tokenizerData.getLineTokens(firstLine), []);
		return line;
	}

	public getLastLine(): Line | null {
		const document = this._document;
		const tokenizerData = this._documentSession.tokenizerData;
		const lastLine = document.getLastLineNode();
		if (lastLine === null) {
			return null;
		}

		const line = new Line(lastLine.text, tokenizerData.getLineTokens(lastLine), []);
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
