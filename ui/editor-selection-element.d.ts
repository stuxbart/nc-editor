import { Line } from '../document';
import { Selection } from '../selection';
export default class EditorSelectionElement {
    private _domElements;
    private _selection;
    constructor(selection: Selection);
    setSelection(selection: Selection): void;
    render(firstVisibleLine: number, linesCount: number, lines: Line[], letterWidth: number): HTMLElement[];
}
