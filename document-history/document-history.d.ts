import DocumentSession from '../document-session/document-session';
import { Point } from '../selection';
export default class DocumentHistory {
    private _documentSession;
    private _undo;
    private _redo;
    private _transaction;
    constructor(documentSession: DocumentSession);
    private get _latestVersion();
    inserted(pos: Point, text: string): void;
    deleted(pos: Point, endPos: Point, text: string): void;
    swappedLinesUp(line: number): void;
    swappedLinesDown(line: number): void;
    startTransaction(): void;
    closeTransaction(): void;
    undo(): void;
    redo(): void;
    clear(): void;
    clearRedo(): void;
    private _applyChanges;
}
