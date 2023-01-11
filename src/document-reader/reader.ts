import DocumentSession from '../document-session/document-session';
import Document from '../document/document';
import Line, { Row } from '../document/line';
import EditSession from '../edit-session/edit-session';
import { Point } from '../selection';

export default abstract class Reader {
	protected _documentSession: DocumentSession;
	protected _editSession: EditSession;

	constructor(documentSesion: DocumentSession, editSession: EditSession) {
		this._documentSession = documentSesion;
		this._editSession = editSession;
	}

	protected get _document(): Document {
		return this._documentSession.document;
	}

	public abstract getLines(firstLine: number, count: number): Line[];

	public abstract getRows(firstRow: number, count: number): Row[];

	public abstract getFirstLine(): Line | null;

	public abstract getLastLine(): Line | null;

	public abstract getTotalLinesCount(): number;

	public abstract getTotalRowsCount(): number;

	public abstract getFirstRowForLine(lineNumber: number): number;

	public abstract getSelectedText(): string;

	public abstract getRowAtPosition(pos: Point): Row | null;
}
