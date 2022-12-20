import DocumentReader from '../document-readers/document-reader';
import DocumentSession from '../document-session/document-session';
import DocumentWriter from '../document-writer/document-writer';
import { HighlighterSchema } from '../highlighter';
import { getMode } from '../modes';
import { SerachResults } from '../search';
import SelectionManager from '../selection/selection-manager';
import { randomString } from '../utils';

export default class EditSession {
	private _id: string;
	private _documentSession: DocumentSession;
	private _highlightingSchema: HighlighterSchema;
	private _searchResults: SerachResults;
	private _selectionManager: SelectionManager;
	private _reader: DocumentReader;
	private _writer: DocumentWriter;

	constructor(documentSession: DocumentSession, modeName: string = 'text') {
		this._id = randomString(10);
		this._documentSession = documentSession;
		this._highlightingSchema = getMode(modeName).schema;

		this._selectionManager = new SelectionManager();
		this._searchResults = new SerachResults();
		this._reader = new DocumentReader(this._documentSession);
		this._writer = new DocumentWriter(this._documentSession);
	}

	public get reader(): DocumentReader {
		return this._reader;
	}

	public get writer(): DocumentWriter {
		return this._writer;
	}
}
