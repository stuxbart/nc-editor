import DocumentSession from '../document-session/document-session';
import Document from '../document/document';
import EditSession from '../edit-session/edit-session';
import { EventEmitter } from '../events';
import { EditorEvents } from './events';
export default class Editor extends EventEmitter<EditorEvents> {
    private _documentSessions;
    private _editSessions;
    private _latestDocId;
    setDocumentMode(mode: string, docSessionId: string): void;
    addDocument(document: Document, name?: string | null, mode?: string): string;
    getDocumentSession(id: string): DocumentSession;
    getLatestDocumentId(): string | null;
    deleteDocument(id: string): void;
    createSession(docId: string): string;
    getSession(id: string): EditSession;
    getEditSessionForDocument(docId: string): EditSession;
    deleteSession(id: string): void;
}
