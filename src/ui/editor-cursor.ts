import { EDITOR_CURSOR_ANIMATED_CSS_CLASS, EDITOR_CURSOR_CSS_CLASS } from './config';
import { createDiv, px } from './dom-utils';

export default class EditorCursor {
	private _left: number = 0;
	private _top: number = 0;
	private _cursorElement: HTMLDivElement | null = null;

	constructor(left: number, top: number) {
		this._left = left;
		this._top = top;
		this._createDOMElement();
	}

	private _createDOMElement(): void {
		this._cursorElement = createDiv(
			EDITOR_CURSOR_CSS_CLASS + ' ' + EDITOR_CURSOR_ANIMATED_CSS_CLASS,
		);
		this._cursorElement.style.top = px(this._top);
		this._cursorElement.style.left = px(this._left);
	}
}
