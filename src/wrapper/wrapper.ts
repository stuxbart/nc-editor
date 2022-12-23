import EditSession from '../edit-session/edit-session';
import WrapData from './wrap-data';

export default class Wrapper {
	private _editSession: EditSession;

	constructor(editSession: EditSession) {
		this._editSession = editSession;
	}

	private get _wrapData(): WrapData {
		return this._editSession.wrapData;
	}

	public wrap(): void {
		this._wrapData.clear();
		const document = this._editSession.documentSession.document;
		this.insertNewLines(0, document.linesCount);
		this.updateLines(0, document.linesCount);
	}

	public insertNewLines(lineNumber: number, linesCount: number): void {
		for (let i = 0; i < linesCount; i++) {
			this._wrapData.insertLine({ data: [] }, lineNumber + i);
		}
	}

	public updateLines(lineNumber: number, linesCount: number): void {
		for (let i = lineNumber; i < lineNumber + linesCount; i++) {
			const line = this._editSession.documentSession.document.getLine(i);
			const wrap = this._wrapLine(line);
			this._wrapData.updateLineData({ data: wrap }, i);
		}
	}

	public removeLines(lineNumber: number, linesCount: number): void {
		for (let i = 0; i < linesCount; i++) {
			this._wrapData.removeLine(lineNumber);
		}
	}

	private _wrapLine(text: string): number[] {
		const maxWidth = this._editSession.visibleColumnsCount;
		const offsets = [];
		let i = 1;
		while (i * maxWidth < text.length) {
			offsets.push(i * maxWidth);
			i++;
		}
		offsets.push(text.length);
		return offsets;
	}
}
