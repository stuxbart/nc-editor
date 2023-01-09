import { Range } from '../selection';
/**
 * Document class is used for storign text data.
 * The class is built on balanced AVL tree.
 */
export default class Document {
    private _tree;
    constructor(text: string);
    /**
     * Insert text at given position. If given line doesn't exist nothing is inserted.
     * Insetring text after line end will append this text to the line.
     * @param text text to be inserted
     * @param line line where insert start
     * @param offset offset relative to line start
     * @returns count of inserted new lines, length of last inserted line
     */
    insert(text: string, line: number, offset: number): [number, number];
    /**
     * Remove text from document, if range does not start in document bounds nothing is deleted.
     * If range ends after document ends remove only existing text.
     * @param range range of text in document that should be deleted
     * @returns text removed from document
     */
    remove(range: Range): string;
    get linesCount(): number;
    get text(): string;
    getText(range: Range): string;
    getLines(firstLine: number, linesCount: number): string[];
    getLine(lineNumber: number): string;
    getFirstLine(): string;
    getLastLine(): string;
    removeLine(lineNumber: number): void;
    insertLineAfter(text: string, lineNumber: number): void;
    insertLineBefore(text: string, lineNumber: number): void;
    swapLineWithNext(lineNumber: number): void;
    swapLineWithPrevious(lineNumber: number): void;
}
