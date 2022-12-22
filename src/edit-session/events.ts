import { IWrapEvents } from '../ui/events';

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

export interface EditSessionEvents
	extends ISelectionChangedEvent,
		ISearchFinishedEvent,
		IWrapEvents {}
