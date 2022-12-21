import { EventEmitter } from '../events';
import EdiotrView from './editor-view';
import { SearchUiEvents } from './events';
declare class EditorSearch extends EventEmitter<SearchUiEvents> {
    private _view;
    private _mountPoint;
    private _searchContainer;
    private _closeButton;
    private _input;
    private _resultsContainer;
    private _isOpen;
    private _seatchMatchesCount;
    private _searchPhrase;
    constructor(view: EdiotrView);
    private get _session();
    update(): void;
    show(): void;
    hide(): void;
    getDOMElement(): HTMLDivElement | null;
    private _initEventListeners;
    private _createSearchContainer;
}
export default EditorSearch;
