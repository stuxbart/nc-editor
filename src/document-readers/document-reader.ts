import DocumentSession from '../document-session/document-session';

export default class DocumentReader {
	private _documentSession: DocumentSession;

	constructor(documentSesion: DocumentSession) {
		this._documentSession = documentSesion;
	}
}
