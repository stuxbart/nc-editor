import DocumentSession from '../document-session/document-session';
import Document from '../document/document';
import EditSession from '../edit-session/edit-session';
import { EventEmitter } from '../events';
import { MODES } from '../modes';
import { EditorEvents, EvDocument } from './events';

export default class Editor extends EventEmitter<EditorEvents> {
	private _documentSessions: Map<string, DocumentSession> = new Map<string, DocumentSession>();
	private _editSessions: Map<string, EditSession> = new Map<string, EditSession>();
	private _latestDocId: string | null = null;

	public setDocumentMode(mode: string, docSessionId: string): void {
		if (!(mode in MODES)) {
			throw new Error("Mode with given name doesn't exist.");
		}
		const session = this.getDocumentSession(docSessionId);
		session.mode = MODES[mode];

		session.tokenize();
	}

	public addDocument(
		document: Document,
		name: string | null = null,
		mode: string = 'default',
	): string {
		if (name === null) {
			name = '';
		}
		const newSession = new DocumentSession(document);
		newSession.setMode(mode);
		this._documentSessions.set(newSession.id, newSession);
		this._latestDocId = newSession.id;

		this.emit(EvDocument.Set, undefined);
		newSession.emitLinesCountChanged(Infinity);
		return newSession.id;
	}

	public getDocumentSession(id: string): DocumentSession {
		const docSession = this._documentSessions.get(id);
		if (!docSession) {
			throw new Error("Document with given id doesn't exist.");
		}
		return docSession;
	}

	public getLatestDocumentId(): string | null {
		return this._latestDocId;
	}

	public deleteDocument(id: string): void {
		if (!(id in this._documentSessions)) {
			throw new Error("Document with given id doesn't exist.");
		}
		throw new Error('Not implemented');
	}

	public createSession(docId: string): string {
		const docSession = this._documentSessions.get(docId);
		if (!docSession) {
			throw new Error("Document with given id doesn't exist.");
		}
		const newEditSession = new EditSession(docSession);
		this._editSessions.set(newEditSession.id, newEditSession);
		return newEditSession.id;
	}

	public getSession(id: string): EditSession {
		const session = this._editSessions.get(id);
		if (!session) {
			throw new Error("Document with given id doesn't exist.");
		}
		return session;
	}

	public getEditSessionForDocument(docId: string): EditSession {
		let latestSession: EditSession | undefined;
		this._editSessions.forEach((editSession) => {
			if (editSession.documentSession.id === docId) {
				latestSession = editSession;
			}
		});
		if (latestSession) {
			return latestSession;
		}
		const latestEditSessionId = this.createSession(docId);
		latestSession = this._editSessions.get(latestEditSessionId);
		if (!latestSession) {
			throw new Error('?');
		}
		return latestSession;
	}

	public deleteSession(id: string): void {
		if (!(id in this._editSessions)) {
			throw new Error("Session with given id doesn't exist.");
		}
		this._editSessions.delete(id);
	}
}
