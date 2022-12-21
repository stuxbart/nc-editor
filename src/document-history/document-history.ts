import DocumentSession from '../document-session/document-session';
import { Point, Range } from '../selection';
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

	public inserted(pos: Point, text: string): void {
		const lines = text.split(/\r?\n|\r/g);
		const endPos = new Point(
			pos.line + lines.length - 1,
			lines.length > 1 ? lines[lines.length - 1].length : pos.offset + lines[0].length,
		);
		const op = new HistoryOperation(HisotryOperations.Insert, pos, endPos, text);
		this._latestVersion.push(op);
	}

	public deleted(pos: Point, endPos: Point, text: string): void {
		const op = new HistoryOperation(HisotryOperations.Delete, pos, endPos, text);
		this._latestVersion.push(op);
	}

	public swappedLinesUp(line: number): void {
		const op = new HistoryOperation(
			HisotryOperations.SwapLines,
			new Point(line - 1, 0),
			new Point(line, 0),
			'',
		);
		this._latestVersion.push(op);
	}

	public swappedLinesDown(line: number): void {
		const op = new HistoryOperation(
			HisotryOperations.SwapLines,
			new Point(line, 0),
			new Point(line + 1, 0),
			'',
		);
		this._latestVersion.push(op);
	}

	public startTransaction(): void {
		this._transaction = true;
		this._undo.push(new HistoryVersion());
		this.clearRedo();
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
		this._applyChanges(nextV.operations);
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
				case HisotryOperations.Insert: {
					const line = op.pos.line;
					const offset = op.pos.offset;
					this._documentSession.document.insert(op.text, line, offset);
					this._documentSession.updateLinesTokens(line);
					this._documentSession.emitLinesCountChanged(1);
					this._documentSession.emitEditEvent();
					break;
				}
				case HisotryOperations.Delete: {
					this._documentSession.document.remove(
						new Range(op.pos.line, op.pos.offset, op.endPos.line, op.endPos.offset),
					);
					this._documentSession.updateLinesTokens(op.pos.line);
					this._documentSession.emitLinesCountChanged(1);
					this._documentSession.emitEditEvent();
					break;
				}
				case HisotryOperations.SwapLines: {
					this._documentSession.document.swapLineWithNext(op.pos.line);
					this._documentSession.updateLinesTokens(op.pos.line);
					this._documentSession.emitLinesCountChanged(1);
					this._documentSession.emitEditEvent();
					break;
				}
				default:
					throw new Error('Invalid operation type.');
					break;
			}
		}
	}
}
