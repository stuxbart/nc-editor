import HistoryOperation from './history-operation';

export default class HistoryVersion {
	private _operations: HistoryOperation[] = [];

	public push(op: HistoryOperation): void {
		this._operations.push(op);
	}

	public get reverseOperations(): HistoryOperation[] {
		return this._operations.map((op) => op.getReverse()).reverse();
	}

	public get operations(): HistoryOperation[] {
		return this._operations;
	}
}
