import EditSession from '../edit-session/edit-session';
export default class SelectionHistory {
    private _editSession;
    private _undo;
    private _redo;
    constructor(editSession: EditSession);
    createSnapshot(): void;
    undo(): void;
    redo(): void;
    clear(): void;
    clearRedo(): void;
    private _applyChanges;
}
