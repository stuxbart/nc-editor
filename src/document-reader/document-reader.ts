import Line, { Row } from '../document/line';
import { TokenizerLineData } from '../tokenizer/tokenizer-data';
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
		// const searchResults = this._editSession.searchResults;
		const rawLines = document.getLines(firstLine, count);
		let linesTokens: TokenizerLineData[] = [];
		try {
			linesTokens = tokenizerData.getLinesData(firstLine, count);
		} catch (err: any) {
			for (let i = 0; i < count; i++) {
				linesTokens.push({ tokens: [], state: { scope: '' }, length: 0 });
			}
		}
		const lines: Line[] = [];

		for (let i = 0; i < count; i++) {
			lines.push({
				rawText: rawLines[i],
				tokens: linesTokens[i].tokens,
				lineBreaks: [],
				searchResults: [],
				// searchResults: [],searchResults.getLineResutls(line).matches,
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
