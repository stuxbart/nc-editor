import { IWrapEvents } from '../ui/events';
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
export interface EditSessionEvents extends ISelectionChangedEvent, ISearchFinishedEvent, IWrapEvents {
}
