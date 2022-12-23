import DocumentSession from '../document-session/document-session';
import Document from '../document/document';
import Line, { Row } from '../document/line';
import EditSession from '../edit-session/edit-session';
export default abstract class Reader {
    protected _documentSession: DocumentSession;
    protected _editSession: EditSession;
    constructor(documentSesion: DocumentSession, editSession: EditSession);
    protected get _document(): Document;
    abstract getLines(firstLine: number, count: number): Line[];
    abstract getRows(firstRow: number, count: number): Row[];
    abstract getFirstLine(): Line | null;
    abstract getLastLine(): Line | null;
    abstract getTotalLinesCount(): number;
    abstract getTotalRowsCount(): number;
    abstract getFirstRowForLine(lineNumber: number): number;
    abstract getSelectedText(): string;
}
