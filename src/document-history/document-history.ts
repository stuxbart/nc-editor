import DocumentSession from '../document-session/document-session';
import { Point } from '../selection';
import HistoryOperation, { HisotryOperations } from './history-operation';
import HistoryVersion from './history-version';

export default class DocumentHistory {
	private _documentSession: DocumentSession;
	private _undo: HistoryVersion[] = [];
	private _redo: HistoryVersion[] = [];
	private _transaction: boolean = false;

	constructor(documentSession: DocumentSession) {
		this._documentSession = documentSession;
	}

	private get _latestVersion(): HistoryVersion {
		return this._undo[this._undo.length - 1];
	}

	public inserted(pos: Point, endPos: Point): void {
		const op = new HistoryOperation(HisotryOperations.Insert, pos, endPos, '');
		this._latestVersion.push(op);
	}

	public deleted(pos: Point, endPos: Point, text: string): void {
		const op = new HistoryOperation(HisotryOperations.Insert, pos, endPos, text);
		this._latestVersion.push(op);
	}

	public startTransaction(): void {
		this._transaction = true;
		this._undo.push(new HistoryVersion());
	}

	public closeTransaction(): void {
		this._transaction = false;
	}

	public undo(): void {
		const lastV = this._undo.pop();
		if (lastV === undefined) {
			return;
		}
		this._applyChanges(lastV.reverseOperations);
		this._redo.push(lastV);
	}

	public redo(): void {
		const nextV = this._redo.pop();
		if (nextV === undefined) {
			return;
		}
		this._applyChanges(nextV.reverseOperations);
		this._undo.push(nextV);
	}

	public clear(): void {
		this._redo = [];
		this._undo = [new HistoryVersion()];
	}

	public clearRedo(): void {
		this._redo = [];
	}

	private _applyChanges(ops: HistoryOperation[]): void {
		for (const op of ops) {
			switch (op.type) {
				case HisotryOperations.Insert:
					break;
				case HisotryOperations.Delete:
					break;
				default:
					break;
			}
		}
	}
}
