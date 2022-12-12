import { Document } from '../document';
import { Mode } from '../mode';
import SelectionManager from '../selection/selection-manager';
import TokenizerData from '../tokenizer/tokenizer-data';
export default class EditorSession {
    private _document;
    private _tokenizerData;
    private _selections;
    private _mode;
    constructor(document: Document, tokenizerData?: TokenizerData | null, selections?: SelectionManager | null, mode?: Mode | null);
    get document(): Document;
    get tokenizerData(): TokenizerData;
    get selections(): SelectionManager;
    get mode(): Mode;
    set mode(value: Mode);
}
