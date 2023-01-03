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
		const sel = this._selection;
		if (sel.isCollapsed || rows.length === 0) {
			return '';
		}
		const firstRow = rows[0];
		const lastRow = rows[rows.length - 1];
		if (firstRow.line > sel.end.line) {
			return '';
		}

		if (lastRow.line < sel.start.line) {
			return '';
		}

		if (firstRow.line === sel.end.line && firstRow.offset > sel.end.offset) {
			return '';
		}

		if (
			lastRow.line === sel.start.line &&
			lastRow.offset + lastRow.text.length < sel.start.offset
		) {
			return '';
		}

		let firstRowNumber = 0;
		let firstRowOffset = 0;

		if (sel.start.line >= firstRow.line) {
			for (let i = 0; i < rows.length; i++) {
				const row = rows[i];
				if (row.line !== sel.start.line) {
					continue;
				}
				if (row.offset + row.text.length >= sel.start.offset) {
					firstRowNumber = i;
					firstRowOffset = sel.start.offset - rows[i].offset;
					break;
				}
			}
		}

		let lastRowNumber = rows.length - 1;
		let lastRowOffset = lastRow.text.length;

		if (sel.end.line <= lastRow.line) {
			for (let i = firstRowNumber; i < rows.length; i++) {
				const row = rows[i];
				if (row.line !== sel.end.line) {
					continue;
				}
				if (row.offset + row.text.length >= sel.end.offset) {
					lastRowNumber = i;
					lastRowOffset = sel.end.offset - row.offset;
					break;
				}
			}
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
