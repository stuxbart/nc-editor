import { Document } from '../document';
import { Mode } from '../mode';
import { Search } from '../search';
import SerachResults from '../search/search-results';
import SelectionManager from '../selection/selection-manager';
import TokenizerData from '../tokenizer/tokenizer-data';
export default class EditorSession {
    private _document;
    private _tokenizerData;
    private _selections;
    private _mode;
    private _searchResults;
    private _search;
    constructor(document: Document, tokenizerData?: TokenizerData | null, selections?: SelectionManager | null, mode?: Mode | null, searchResults?: SerachResults | null, search?: Search | null);
    get document(): Document;
    get tokenizerData(): TokenizerData;
    get selections(): SelectionManager;
    get mode(): Mode;
    set mode(value: Mode);
    get searchResults(): SerachResults;
    get search(): Search;
}
