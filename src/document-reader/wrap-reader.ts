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

	public getRows(firstLine: number, count: number): Row[] {
		const document = this._document;
		const tokenizerData = this._documentSession.tokenizerData;
		const searchResults = this._editSession.searchResults;
		const wrapData = this._editSession.wrapData;
		const rowsWrapData = wrapData.getRows(firstLine, count);
		const lineNumbers = rowsWrapData.map((w) => w.line);
		const firstLineIndex = Math.min(...lineNumbers);
		const lastLineIndex = Math.max(...lineNumbers);
		const rawLines = document.getLineNodes(firstLineIndex, lastLineIndex - firstLineIndex + 1);
		const rows: Row[] = [];
		let off = 0;

		for (const row of rowsWrapData) {
			const lineTokens: Token[] = tokenizerData.getLineTokens(
				rawLines[row.line - firstLineIndex],
			);
			const rowTokens: Token[] = [];
			for (const token of lineTokens) {
				if (token.startIndex < off) {
					continue;
				}
				if (token.startIndex < row.offset) {
					rowTokens.push({ startIndex: token.startIndex - off, type: token.type });
				} else {
					break;
				}
			}
			const lineSearchResults: number[] = searchResults.getLineResutls(
				rawLines[row.line - firstLineIndex],
			).matches;
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
				text: rawLines[row.line - firstLineIndex].text.substring(off, row.offset),
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

	public getSelectedText(): string {
		let text = '';
		for (const sel of this._editSession.selections.getSelections()) {
			text += this._document.getText(sel);
		}
		return text;
	}
}
