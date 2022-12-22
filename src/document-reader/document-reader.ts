import Line, { Row } from '../document/line';
import Reader from './reader';

export default class DocumentReader extends Reader {
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
