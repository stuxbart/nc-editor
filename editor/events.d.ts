export declare enum EvTokenizer {
    Finished = "tokenizer.Tokenized"
}
export interface ITokenizerEvent {
    [EvTokenizer.Finished]: undefined;
}
export declare enum EvDocument {
    Set = "editor.Document.Set",
    Edited = "editor.Document.Edit",
    LinesCount = "editor.Document.LinesCount"
}
export interface IDocumentEditedEvent {
    [EvDocument.Edited]: undefined;
}
export interface IDocumentSetEvent {
    [EvDocument.Set]: undefined;
}
export interface IDocumentLinesCountChanged {
    [EvDocument.LinesCount]: {
        linesCount: number;
    };
}
export declare enum EvSelection {
    Changed = "editor.Selection.Changed"
}
export interface ISelectionChangedEvent {
    [EvSelection.Changed]: undefined;
}
export declare enum EvSearch {
    Finished = "editor.Search.Finished"
}
export interface ISearchFinishedEvent {
    [EvSearch.Finished]: undefined;
}
export interface EditorEvents extends IDocumentSetEvent {
}
