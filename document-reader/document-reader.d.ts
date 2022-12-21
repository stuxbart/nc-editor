import DocumentSession from '../document-session/document-session';
import Line from '../document/line';
import EditSession from '../edit-session/edit-session';
export default class DocumentReader {
    private _documentSession;
    private _editSession;
    constructor(documentSesion: DocumentSession, editSession: EditSession);
    private get _document();
    getLines(firstLine: number, count: number): Line[];
    getFirstLine(): Line | null;
    getLastLine(): Line | null;
    getTotalLinesCount(): number;
}
