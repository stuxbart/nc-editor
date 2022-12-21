import DocumentSession from '../document-session/document-session';
import EditSession from '../edit-session/edit-session';
export default class DocumentWriter {
    private _documentSession;
    private _editSession;
    constructor(documentSesion: DocumentSession, editSession: EditSession);
    private get _document();
    insert(str: string): void;
    remove(type?: number): string;
    removeWordBefore(): string;
    removeWordAfter(): string;
    cut(): void;
    copy(): void;
    swapLinesUp(): void;
    swapLinesDown(): void;
    indentSelectedLines(indentString?: string): void;
    removeIndentFromSelectedLines(indentString?: string): void;
}
