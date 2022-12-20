import DocumentSession from '../document-session/document-session';
import Document from '../document/document';
import EditSession from '../edit-session/edit-session';
import { EventEmitter } from '../events';
import { MODES } from '../modes';
import { EditorEvents, EvDocument } from './events';

export default class Editor extends EventEmitter<EditorEvents> {
	private _documentSessions: Record<string, DocumentSession> = {};
	private _editSessions: Record<string, EditSession> = {};
	private _latestDocId: string | null = null;

	private _getDocumentSession(id: string): DocumentSession {
		if (id in this._documentSessions) {
			return this._documentSessions[id];
		}
		throw new Error("Session doesn't exist.");
	}

	public setDocumentMode(mode: string, docSessionId: string): void {
		if (!(mode in MODES)) {
			throw new Error("Mode with given name doesn't exist.");
		}
		const session = this._getDocumentSession(docSessionId);
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
		this._documentSessions[newSession.id] = newSession;
		this._latestDocId = newSession.id;

		this.emit(EvDocument.Set, undefined);
		newSession.emitLinesCountChanged(Infinity);
		return newSession.id;
	}

	public getDocumentSession(id: string): DocumentSession {
		if (!(id in this._documentSessions)) {
			throw new Error("Document with given id doesn't exist.");
		}
		return this._documentSessions[id];
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
		if (!(docId in this._documentSessions)) {
			throw new Error("Document with given id doesn't exist.");
		}
		const docSession = this._documentSessions[docId];
		const newEditSession = new EditSession(docSession);
		this._editSessions[newEditSession.id] = newEditSession;
		return newEditSession.id;
	}

	public getSession(id: string): EditSession {
		if (!(id in this._editSessions)) {
			throw new Error("Document with given id doesn't exist.");
		}
		return this._editSessions[id];
	}

	public deleteSession(id: string): void {
		if (!(id in this._editSessions)) {
			throw new Error("Session with given id doesn't exist.");
		}
		const newSessions: Record<string, EditSession> = {};
		Object.keys(this._editSessions).forEach((sessionId: string) => {
			if (sessionId !== id) {
				newSessions[sessionId] = this._editSessions[sessionId];
			}
		});
		this._editSessions = newSessions;
	}
}
