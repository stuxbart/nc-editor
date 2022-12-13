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
	Set = 'editor.Document.Set',
	Edited = 'editor.Document.Edit',
	LinesCount = 'editor.Document.LinesCount',
}
export interface IDocumentEditedEvent {
	[EvDocument.Edited]: undefined;
}
export interface IDocumentSetEvent {
	[EvDocument.Set]: undefined;
}
export interface IDocumentLinesCountChanged {
	[EvDocument.LinesCount]: { linesCount: number };
}

/*
 * Selection events
 */
export enum EvSelection {
	Changed = 'editor.Selection.Changed',
}
export interface ISelectionChangedEvent {
	[EvSelection.Changed]: undefined;
}

/*
 * Search events
 */
export enum EvSearch {
	Finished = 'editor.Search.Finished',
}
export interface ISearchFinishedEvent {
	[EvSearch.Finished]: undefined;
}

export interface EditorEvents
	extends ITokenizerEvent,
		IDocumentEditedEvent,
		IDocumentSetEvent,
		IDocumentLinesCountChanged,
		ISelectionChangedEvent,
		ISearchFinishedEvent {}
