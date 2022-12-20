import DocumentSession from '../document-session/document-session';
import Document from '../document/document';
import Line from '../document/line';
import EditSession from '../edit-session/edit-session';

export default class DocumentReader {
	private _documentSession: DocumentSession;
	private _editSession: EditSession;

	constructor(documentSesion: DocumentSession, editSession: EditSession) {
		this._documentSession = documentSesion;
		this._editSession = editSession;
	}

	private get _document(): Document {
		return this._documentSession.document;
	}

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
}
