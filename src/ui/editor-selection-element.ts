import { Selection } from '../selection';
import { offsetToColumn } from '../text-utils';
import { CSSClasses } from '../styles/css';
import { px } from './dom-utils';
import { Row } from '../document/line';

export default class EditorSelectionElement {
	private _selection: Selection;

	constructor(selection: Selection) {
		this._selection = selection;
	}

	public setSelection(selection: Selection): void {
		this._selection = selection;
	}

	public render(rows: Row[], letterWidth: number): string {
		if (this._selection.isCollapsed) {
			return '';
		}
		const sel = this._selection;

		let firstRowNumber = 0;
		let firstRowOffset = 0;
		if (
			!(sel.start.line < rows[0].line) &&
			!(sel.start.line === rows[0].line && sel.start.offset <= rows[0].offset)
		) {
			for (firstRowNumber = 0; firstRowNumber < rows.length; firstRowNumber++) {
				const row = rows[firstRowNumber];
				if (
					row.line === sel.start.line &&
					row.offset + row.text.length >= sel.start.offset &&
					sel.start.offset >= row.offset
				) {
					firstRowOffset = sel.start.offset - row.offset;
					break;
				}
			}
		}
		if (firstRowNumber === rows.length) {
			return '';
		}
		let lastRowNumber = 0;
		let lastRowOffset = 0;
		if (
			!(sel.end.line < rows[0].line) &&
			!(sel.end.line === rows[0].line && sel.end.offset <= rows[0].offset)
		) {
			const lastRow = rows[rows.length - 1];
			if (lastRow.line < sel.end.line) {
				lastRowNumber = rows.length - 1;
				lastRowOffset = rows[lastRowNumber].text.length;
			} else {
				for (lastRowNumber = 0; lastRowNumber < rows.length; lastRowNumber++) {
					const row = rows[lastRowNumber];
					if (
						row.line === sel.end.line &&
						row.offset + row.text.length >= sel.end.offset &&
						sel.end.offset >= row.offset
					) {
						lastRowOffset = sel.end.offset - row.offset;
						break;
					}
				}
			}
		} else {
			return '';
		}

		const rowsLengths = rows.map((row) => row.text.length);
		let html = '';
		for (let i = firstRowNumber; i < lastRowNumber + 1; i++) {
			const row = rows[i].text;
			let startPos = 0;
			let endPos = offsetToColumn(row, rowsLengths[i]);
			if (i === firstRowNumber) {
				startPos = offsetToColumn(row, firstRowOffset);
			}
			if (i === lastRowNumber) {
				endPos = offsetToColumn(row, lastRowOffset);
			}
			const left = px(startPos * letterWidth);
			const top = px(i * 20);
			const width = px((endPos - startPos) * letterWidth || letterWidth);
			const height = px(20);
			html += `<div class="${CSSClasses.SELECTION_RANGE}" style="top: ${top}; left: ${left}; width: ${width}; height: ${height}"></div>`;
		}
		return html;
	}
}
