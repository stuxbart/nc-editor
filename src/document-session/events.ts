/*
 * Tokenizer events
 */
export enum EvTokenizer {
	Finished = 'tokenizer.Tokenized',
}
export interface ITokenizerEvent {
	[EvTokenizer.Finished]: undefined;
}

/*
 * Document events
 */
export enum EvDocument {
	Edited = 'editor.Document.Edit',
	LinesCount = 'editor.Document.LinesCount',
	Set = 'editor.Document.Set',
}
export interface IDocumentEditedEvent {
	[EvDocument.Edited]: undefined;
}
export interface IDocumentLinesCountChanged {
	[EvDocument.LinesCount]: { linesCount: number };
}
export interface IDocumentSet {
	[EvDocument.Set]: undefined;
}
export interface DocumentSessionEvents
	extends ITokenizerEvent,
		IDocumentEditedEvent,
		IDocumentLinesCountChanged {}
