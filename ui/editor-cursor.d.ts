export default class EditorCursor {
    private _left;
    private _top;
    private _cursorElement;
    constructor(left: number, top: number);
    getDOMElment(): HTMLDivElement | null;
    private _createDOMElement;
}
