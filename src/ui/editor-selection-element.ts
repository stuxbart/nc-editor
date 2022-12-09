import { Line } from '../document';
import { Selection } from '../selection';
import { offsetToColumn } from '../text-utils';
import { CSSClasses } from './config';
import { createDiv, px } from './dom-utils';

export default class EditorSelectionElement {
	private _domElements: HTMLElement[] = [];
	private _selection: Selection;

	constructor(selection: Selection) {
		this._selection = selection;
	}

	public setSelection(selection: Selection): void {
		this._selection = selection;
	}

	public render(
		firstVisibleLine: number,
		linesCount: number,
		lines: Line[],
		letterWidth: number,
	): HTMLElement[] {
		if (this._selection.isCollapsed) {
			return [];
		}
		const linesLengths = lines.map((line) => line.rawText.length);
		const startLine = Math.max(this._selection.start.line, firstVisibleLine) - firstVisibleLine;
		const endLine =
			Math.min(this._selection.end.line + 1, firstVisibleLine + linesCount) -
			firstVisibleLine;

		const linesToRender = endLine - startLine;
		if (linesToRender !== this._domElements.length) {
			this._domElements = [];
		}
		for (let i = startLine; i < endLine; i++) {
			const line = lines[i]?.rawText ?? '';
			let startPos = 0;
			let endPos = offsetToColumn(line, linesLengths[i]);
			if (i === this._selection.start.line - firstVisibleLine) {
				startPos = offsetToColumn(line, this._selection.start.offset);
			}
			if (i === this._selection.end.line - firstVisibleLine) {
				endPos = offsetToColumn(line, this._selection.end.offset);
			}
			const left = px(startPos * letterWidth);
			const top = px(i * 20);
			const width = px((endPos - startPos) * letterWidth || letterWidth);
			const height = px(20);
			if (linesToRender === this._domElements.length) {
				const index = i - startLine;
				this._domElements[index].style.left = left;
				this._domElements[index].style.top = top;
				this._domElements[index].style.width = width;
				this._domElements[index].style.height = height;
			} else {
				const element = createDiv(CSSClasses.SELECTION_RANGE);
				element.style.left = left;
				element.style.top = top;
				element.style.width = width;
				element.style.height = height;
				this._domElements.push(element);
			}
		}
		return this._domElements;
	}
}
