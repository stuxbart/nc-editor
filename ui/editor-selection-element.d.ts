import { Selection } from '../selection';
import { Row } from '../document/line';
export default class EditorSelectionElement {
    private _selection;
    constructor(selection: Selection);
    setSelection(selection: Selection): void;
    render(rows: Row[], letterWidth: number): string;
}
