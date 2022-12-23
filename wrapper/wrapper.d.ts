import EditSession from '../edit-session/edit-session';
export default class Wrapper {
    private _editSession;
    constructor(editSession: EditSession);
    private get _wrapData();
    wrap(): void;
    insertNewLines(lineNumber: number, linesCount: number): void;
    updateLines(lineNumber: number, linesCount: number): void;
    removeLines(lineNumber: number, linesCount: number): void;
    private _wrapLine;
}
