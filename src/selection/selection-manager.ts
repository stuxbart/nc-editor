import { Document } from '../document';
import { getWordAfter, getWordBefore, removeAccents } from '../text-utils';
import Point from './point';
import Selection from './selection';
import { pointCompare } from './utils';

export default class SelectionManager {
	private _selections: Selection[] = [];
	private _document: Document | null = null;
	private _shouldUpdateSelections: boolean = true;

	constructor(document: Document | null = null) {
		this._document = document;
		this._selections = [new Selection(0, 0, 0, 0)];
	}

	public get length(): number {
		return this._selections.length;
	}

	public getSelections(): Selection[] {
		return this._selections;
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

	public setSelection(selection: Selection): void {
		this._selections = [selection];
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
	}

	public selectWordBefore(): void {
		if (this._selections.length !== 1 || this._document === null) {
			return;
		}
		const sel = this._selections[0];
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
		this._removeOverlappingSelections();
	}

	public selectWordAfter(): void {
		if (this._selections.length !== 1 || this._document === null) {
			return;
		}
		const sel = this._selections[0];
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
	}

	public getActiveLinesNumbers(): Set<number> {
		if (this._document === null || this._selections.length === 0) {
			return new Set();
		}
		const activeLines = new Set<number>();
		for (const sel of this._selections) {
			for (let i = sel.start.line; i < sel.end.line + 1; i++) {
				activeLines.add(i);
			}
		}
		return activeLines;
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
}
