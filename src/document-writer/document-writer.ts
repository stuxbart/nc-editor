import DocumentSession from '../document-session/document-session';

export default class DocumentWriter {
	private _documentSession: DocumentSession;

	constructor(documentSesion: DocumentSession) {
		this._documentSession = documentSesion;
	}
}
