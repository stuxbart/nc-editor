import HistoryOperation from './history-operation';
export default class HistoryVersion {
    private _operations;
    push(op: HistoryOperation): void;
    get reverseOperations(): HistoryOperation[];
    get operations(): HistoryOperation[];
}
