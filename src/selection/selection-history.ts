import EditSession from '../edit-session/edit-session';
import Selection from './selection';

export default class SelectionHistory {
	private _editSession: EditSession;
	private _undo: Selection[][] = [];
	private _redo: Selection[][] = [];

	constructor(editSession: EditSession) {
		this._editSession = editSession;
	}

	public createSnapshot(): void {
		const selections = this._editSession.selections.getSelections();
		const newSelections = selections.map(
			(sel) => new Selection(sel.start.line, sel.start.offset, sel.end.line, sel.end.offset),
		);
		this._undo.push(newSelections);
	}

	public undo(): void {
		const lastV = this._undo.pop();
		if (lastV === undefined) {
			return;
		}
		this._applyChanges(lastV);
		this._redo.push(lastV);
	}

	public redo(): void {
		const nextV = this._redo.pop();
		if (nextV === undefined) {
			return;
		}
		this._applyChanges(nextV);
		this._undo.push(nextV);
	}

	public clear(): void {
		this._redo = [];
		this._undo = [];
	}

	public clearRedo(): void {
		this._redo = [];
	}

	private _applyChanges(ops: Selection[]): void {
		this._editSession.selections.setSelections(ops);
		this._editSession.emitSelectionChangedEvent();
	}
}
