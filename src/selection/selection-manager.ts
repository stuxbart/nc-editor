import { Document } from '../document';
import Reader from '../document-reader/reader';
import EditSession from '../edit-session/edit-session';
import {
	columnToOffset,
	getWordAfter,
	getWordBefore,
	offsetToColumn,
	readWhiteSpaceAfter,
	removeAccents,
} from '../text-utils';
import Point from './point';
import Selection, { SelectionType } from './selection';
import { pointCompare } from './utils';

export default class SelectionManager {
	private _selections: Selection[] = [];
	private _editSession: EditSession;
	private _document: Document | null = null;
	private _shouldUpdateSelections: boolean = true;
	private _rectSelectionStart: Point | null = null;

	constructor(editSession: EditSession) {
		this._editSession = editSession;
		this._document = editSession.documentSession.document;
		this._selections = [new Selection(0, 0, 0, 0)];
	}
	private get _reader(): Reader {
		return this._editSession.reader;
	}

	public get length(): number {
		return this._selections.length;
	}

	public getSelections(): Selection[] {
		return this._selections;
	}

	public getCursorsPositions(): Point[] {
		return this._selections.map((sel) => (sel.type === SelectionType.L ? sel.start : sel.end));
	}

	public enableUpdatingSelections(): void {
		this._shouldUpdateSelections = true;
	}

	public disableUpdatingSelections(): void {
		this._shouldUpdateSelections = false;
	}

	public update(line: number, offset: number, lineDiff: number, offsetDiff: number): void {
		if (!this._shouldUpdateSelections) {
			return;
		}
		let op = 0;
		if (lineDiff < 0) {
			op = 0;
		} else {
			if (offsetDiff < 0) {
				op = 0;
			} else {
				op = 1;
			}
		}
		const start = new Point(line, offset);
		const end = new Point(line - lineDiff, offset - offsetDiff);

		for (const selection of this._selections) {
			for (const point of [selection.start, selection.end]) {
				if (op) {
					if (pointCompare(point, start) !== 2) {
						if (point.line === line) {
							if (lineDiff) {
								point.offset = point.offset - start.offset + offsetDiff;
							} else {
								point.offset += offsetDiff;
							}
						}
						point.line += lineDiff;
					}
				} else {
					if (
						point.line >= start.line &&
						point.line <= end.line &&
						point.offset >= end.offset - 1
					) {
						if (pointCompare(point, end) !== 1) {
							point.offset = start.offset;
							point.line = start.line;
						} else {
							point.line = start.line;
							point.offset = start.offset + point.offset - end.offset;
						}
					}
				}
			}
		}

		this._removeOverlappingSelections();
	}

	public clear(): void {
		this._selections = [];
		this._clearRectSelectionStart();
	}

	public setSelection(selection: Selection): void {
		this._selections = [selection];
		this._clearRectSelectionStart();
	}

	public setSelections(selection: Selection[]): void {
		this._selections = selection;
		this._clearRectSelectionStart();
		this._removeOverlappingSelections();
	}

	public addSelection(selection: Selection): void {
		this._selections.push(selection);
		this._removeOverlappingSelections();
	}

	public extendLastSelection(point: Point): void {
		if (this._selections.length === 0) {
			return;
		}
		const lastSelection = this._selections[this._selections.length - 1];
		lastSelection.updateSelection(point);
		this._removeOverlappingSelections();
		this._clearRectSelectionStart();
	}

	public selectAll(): void {
		const selection = new Selection(0, 0, 0, 0);
		if (this._document) {
			const linesCount = this._document.linesCount;
			const lastLine = this._document.getLastLine();
			selection.end.line = linesCount - 1;
			selection.end.offset = lastLine.length;
		}
		this._selections = [selection];
		this._clearRectSelectionStart();
	}

	public selectWordAt(point: Point, addSelection: boolean = false): void {
		if (this._document === null) {
			return;
		}
		const line = removeAccents(this._document.getLine(point.line));
		const wordBefore = getWordBefore(line, point.offset);
		const wordAfter = getWordAfter(line, point.offset);
		const sel = new Selection(
			point.line,
			point.offset - wordBefore.length,
			point.line,
			point.offset + wordAfter.length,
		);
		if (addSelection) {
			this._selections.push(sel);
		} else {
			this._selections = [sel];
		}
		this._removeOverlappingSelections();
		this._clearRectSelectionStart();
	}

	public selectWordBefore(): void {
		if (this._selections.length < 1 || this._document === null) {
			return;
		}
		for (const sel of this._selections) {
			if (sel.start.line === 0 && sel.start.offset === 0) {
				return;
			}

			if (sel.start.offset === 0) {
				sel.start.line -= 1;
				const lineBefore = removeAccents(this._document.getLine(sel.start.line));
				const word = getWordBefore(lineBefore, lineBefore.length);
				sel.start.offset = lineBefore.length - word.length;
			} else {
				const line = removeAccents(this._document.getLine(sel.start.line));
				const word = getWordBefore(line, sel.start.offset);
				sel.start.offset -= word.length;
			}
			sel.type = SelectionType.L;
		}
		this._removeOverlappingSelections();
		this._clearRectSelectionStart();
	}

	public selectWordAfter(): void {
		if (this._selections.length < 1 || this._document === null) {
			return;
		}
		for (const sel of this._selections) {
			const line = removeAccents(this._document.getLine(sel.end.line));
			if (sel.end.line === this._document.linesCount - 1 && sel.end.offset === line.length) {
				return;
			}
			if (sel.end.offset === line.length) {
				sel.end.line += 1;
				const lineAfter = removeAccents(this._document.getLine(sel.end.line));
				const word = getWordAfter(lineAfter, 0);
				sel.end.offset = word.length;
			} else {
				const word = getWordAfter(line, sel.end.offset);
				sel.end.offset += word.length;
			}
			sel.type = SelectionType.R;
		}
		this._removeOverlappingSelections();
		this._clearRectSelectionStart();
	}

	public selectStartOfTheLine(): void {
		if (this._selections.length < 1 || this._document === null) {
			return;
		}
		for (const sel of this._selections) {
			const row = this._reader.getRowAtPosition(sel.start);
			if (row === null) {
				continue;
			}
			const whiteSpaceLength = readWhiteSpaceAfter(row.text, 0);
			if (sel.type === SelectionType.R) {
				if (sel.end.offset === whiteSpaceLength + row.offset) {
					sel.end.offset = row.offset;
				} else {
					sel.end.offset = row.offset + whiteSpaceLength;
				}
				if (sel.start.line === sel.end.line) {
					const tmpOffset = sel.start.offset;
					sel.start.offset = sel.end.offset;
					sel.end.offset = tmpOffset;
					sel.type = SelectionType.L;
				}
			} else {
				if (sel.start.offset === whiteSpaceLength) {
					sel.start.offset = row.offset;
				} else {
					sel.start.offset = row.offset + whiteSpaceLength;
				}
				sel.type = SelectionType.L;
			}
		}

		this._removeOverlappingSelections();
		this._clearRectSelectionStart();
	}

	public selectEndOfTheLine(): void {
		if (this._selections.length < 1 || this._document === null) {
			return;
		}

		for (const sel of this._selections) {
			const row = this._reader.getRowAtPosition(sel.start);
			if (row === null) {
				continue;
			}
			if (sel.type === SelectionType.L) {
				sel.start.offset = row.offset + row.text.length;
				if (sel.start.line === sel.end.line) {
					const tmpOffset = sel.start.offset;
					sel.start.offset = sel.end.offset;
					sel.end.offset = tmpOffset;
					sel.type = SelectionType.R;
				}
			} else {
				sel.end.offset = row.offset + row.text.length;
				sel.type = SelectionType.R;
			}
		}

		this._removeOverlappingSelections();
		this._clearRectSelectionStart();
	}

	public moveSelectionWordBefore(): void {
		if (this._document === null) {
			return;
		}
		for (const sel of this._selections) {
			if (sel.start.line === 0 && sel.start.offset === 0) {
				continue;
			}
			if (sel.start.offset === 0) {
				sel.start.line -= 1;
				const lineBefore = removeAccents(this._document.getLine(sel.start.line));
				sel.start.offset = lineBefore.length;
			} else {
				const line = removeAccents(this._document.getLine(sel.start.line));
				const word = getWordBefore(line, sel.start.offset);
				sel.start.offset -= word.length;
			}
			sel.end.offset = sel.start.offset;
			sel.end.line = sel.start.line;
		}
		this._removeOverlappingSelections();
		this._clearRectSelectionStart();
	}

	public moveSelectionWordAfter(): void {
		if (this._document === null) {
			return;
		}
		for (const sel of this._selections) {
			const line = removeAccents(this._document.getLine(sel.end.line));
			if (sel.end.line === this._document.linesCount - 1 && sel.end.offset === line.length) {
				continue;
			}
			if (sel.end.offset === line.length) {
				sel.end.line += 1;
				sel.end.offset = 0;
			} else {
				const word = getWordAfter(line, sel.end.offset);
				sel.end.offset += word.length;
			}
			sel.start.offset = sel.end.offset;
			sel.start.line = sel.end.line;
		}
		this._removeOverlappingSelections();
		this._clearRectSelectionStart();
	}
	/**
	 * point.offset for this function should be column in row
	 */
	public extendRectangleSelection(point: Point): void {
		if (this._document === null) {
			return;
		}
		if (this._rectSelectionStart === null) {
			const lastSelection = this._selections[this._selections.length - 1];
			this._rectSelectionStart = new Point(0, 0);
			if (lastSelection.type === SelectionType.L) {
				this._rectSelectionStart.line = lastSelection.end.line;
				this._rectSelectionStart.offset = lastSelection.end.offset;
			} else {
				this._rectSelectionStart.line = lastSelection.start.line;
				this._rectSelectionStart.offset = lastSelection.start.offset;
			}
			const row = this._reader.getRowAtPosition(this._rectSelectionStart);
			if (row === null) {
				return;
			}
			this._rectSelectionStart.line = row.number;
			this._rectSelectionStart.offset = offsetToColumn(
				row.text,
				this._rectSelectionStart.offset - row.offset,
			);
		}
		this._selections = [];
		const startRowNumber = Math.min(point.line, this._rectSelectionStart.line);
		const endRowNumber = Math.max(point.line, this._rectSelectionStart.line);
		const startColumn = Math.min(point.offset, this._rectSelectionStart.offset);
		const endColumn = Math.max(point.offset, this._rectSelectionStart.offset);

		for (let index = startRowNumber; index < endRowNumber + 1; index++) {
			const rows = this._reader.getRows(index, 1);
			if (rows.length === 0) {
				continue;
			}
			const row = rows[0];
			const lineColumns = offsetToColumn(row.text, row.text.length);
			if (startColumn > lineColumns) {
				continue;
			}
			const startOffset = columnToOffset(row.text, startColumn);
			const endOffset =
				endColumn < lineColumns ? columnToOffset(row.text, endColumn) : row.text.length;
			this._selections.push(
				new Selection(row.line, startOffset + row.offset, row.line, endOffset + row.offset),
			);
		}
		this._removeOverlappingSelections();
	}

	public collapseSelectionToLeft(): void {
		if (this._selections.length < 1 || this._document === null) {
			return;
		}

		for (const sel of this._selections) {
			if (sel.isCollapsed) {
				if (sel.start.line === 0 && sel.start.offset === 0) {
					continue;
				}
				sel.start.offset -= 1;
				sel.end.offset -= 1;
				if (sel.start.offset < 0) {
					const newLine = sel.start.line - 1;
					const prevLineLength = this._document.getLine(newLine).length;
					sel.start.line = newLine;
					sel.end.line = newLine;
					sel.start.offset = prevLineLength;
					sel.end.offset = prevLineLength;
				}
			} else {
				sel.end.line = sel.start.line;
				sel.end.offset = sel.start.offset;
			}
		}
		this._clearRectSelectionStart();
	}

	public collapseSelectionToRight(): void {
		if (this._selections.length < 1 || this._document === null) {
			return;
		}
		const lastLineNumber = this._document.linesCount - 1;
		const lastLineLength = this._document.getLine(lastLineNumber).length;
		for (const sel of this._selections) {
			if (sel.isCollapsed) {
				if (sel.start.line === lastLineNumber && sel.start.offset === lastLineLength) {
					continue;
				}
				sel.start.offset += 1;
				sel.end.offset += 1;
				const lineLength = this._document.getLine(sel.start.line).length;
				if (sel.start.offset > lineLength) {
					const newLine = sel.start.line + 1;
					sel.start.line = newLine;
					sel.end.line = newLine;
					sel.start.offset = 0;
					sel.end.offset = 0;
				}
			} else {
				sel.start.line = sel.end.line;
				sel.start.offset = sel.end.offset;
			}
		}
		this._clearRectSelectionStart();
	}

	public collapseSelectionToTop(): void {
		if (this._selections.length < 1 || this._document === null) {
			return;
		}

		for (const sel of this._selections) {
			if (sel.start.line === 0) {
				sel.start.offset = 0;
				sel.end.offset = 0;
				sel.end.line = 0;
				continue;
			}
			const newLine = sel.start.line - 1;
			const lineLength = this._document.getLine(newLine).length;
			const newOffset = lineLength < sel.start.offset ? lineLength : sel.start.offset;
			sel.start.offset = newOffset;
			sel.end.offset = newOffset;
			sel.start.line = newLine;
			sel.end.line = newLine;
		}
		this._clearRectSelectionStart();
	}

	public collapseSelectionToBottom(): void {
		if (this._selections.length < 1 || this._document === null) {
			return;
		}
		const lastLineNumber = this._document.linesCount - 1;
		const lastLineLength = this._document.getLine(lastLineNumber).length;
		for (const sel of this._selections) {
			if (sel.end.line === lastLineNumber) {
				sel.start.offset = lastLineLength;
				sel.end.offset = lastLineLength;
				sel.start.line = lastLineNumber;
				continue;
			}
			const newLine = sel.start.line + 1;
			const lineLength = this._document.getLine(newLine).length;
			const newOffset = lineLength < sel.end.offset ? lineLength : sel.end.offset;
			sel.start.offset = newOffset;
			sel.end.offset = newOffset;
			sel.start.line = newLine;
			sel.end.line = newLine;
		}
		this._clearRectSelectionStart();
	}

	public collapseSelectionToHome(): void {
		if (this._selections.length < 1 || this._document === null) {
			return;
		}
		for (const sel of this._selections) {
			let line: string = '';
			let currentOffset: number = 0;
			if (sel.type === SelectionType.L) {
				line = this._document.getLine(sel.start.line);
				sel.end.line = sel.start.line;
				currentOffset = sel.start.offset;
			} else {
				line = this._document.getLine(sel.end.line);
				sel.start.line = sel.end.line;
				currentOffset = sel.end.offset;
			}
			const whiteSpaceLength = readWhiteSpaceAfter(line, 0);
			if (currentOffset === whiteSpaceLength) {
				sel.start.offset = 0;
				sel.end.offset = 0;
			} else {
				sel.start.offset = whiteSpaceLength;
				sel.end.offset = whiteSpaceLength;
			}
		}
		this._clearRectSelectionStart();
		this._removeOverlappingSelections();
	}

	public collapseSelectionToEnd(): void {
		if (this._selections.length < 1 || this._document === null) {
			return;
		}
		for (const sel of this._selections) {
			let line: string = '';
			if (sel.type === SelectionType.L) {
				line = this._document.getLine(sel.start.line);
				sel.end.line = sel.start.line;
			} else {
				line = this._document.getLine(sel.end.line);
				sel.start.line = sel.end.line;
			}
			const lineLength = line.length;

			sel.start.offset = lineLength;
			sel.end.offset = lineLength;
		}
		this._clearRectSelectionStart();
		this._removeOverlappingSelections();
	}

	public getActiveLinesNumbers(
		firstLine: number = 0,
		linesCount: number = Infinity,
	): Set<number> {
		if (this._document === null || this._selections.length === 0) {
			return new Set();
		}
		const activeLines = new Set<number>();
		for (const sel of this._selections) {
			const startLine = Math.max(firstLine, sel.start.line);
			const endLine = Math.min(sel.end.line + 1, firstLine + linesCount);
			for (let i = startLine; i < endLine; i++) {
				activeLines.add(i);
			}
		}
		return activeLines;
	}

	public getSelectedLinesCount(): number {
		const selectedLines = this.getActiveLinesNumbers();
		const count = selectedLines.size;
		return count;
	}

	public onlyLastSelection(): void {
		if (this._selections.length === 0) {
			return;
		}
		this._selections = [this._selections[this._selections.length - 1]];
	}

	public selectLine(lineNumber: number): void {
		if (!this._document) {
			return;
		}
		if (lineNumber >= this._document.linesCount) {
			return;
		}
		if (lineNumber + 1 === this._document.linesCount) {
			const line = this._document.getLine(lineNumber);
			const sel = new Selection(lineNumber, 0, lineNumber, line.length);
			sel.type = SelectionType.R;
			this._selections = [sel];
		} else {
			const sel = new Selection(lineNumber, 0, lineNumber + 1, 0);
			sel.type = SelectionType.R;
			this._selections = [sel];
		}
	}

	private _removeOverlappingSelections(): void {
		if (this._document === null || this._selections.length < 2) {
			return;
		}
		const selectionToRemove: number[] = [];
		for (let i = 0; i < this._selections.length; i++) {
			const sel = this._selections[i];
			for (let j = i + 1; j < this._selections.length; j++) {
				const sel2 = this._selections[j];
				if (sel.overlaps(sel2)) {
					selectionToRemove.push(i);
				}
			}
		}
		let delta = 0;
		for (const selectionNumber of selectionToRemove) {
			this._selections.splice(selectionNumber - delta, 1);
			delta++;
		}
	}

	private _clearRectSelectionStart(): void {
		this._rectSelectionStart = null;
	}
}
