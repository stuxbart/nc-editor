import Line, { Row } from '../document/line';
import Reader from './reader';
export default class WrapReader extends Reader {
    getLines(firstLine: number, count: number): Line[];
    getRows(firstRow: number, count: number): Row[];
    getFirstLine(): Line | null;
    getLastLine(): Line | null;
    getTotalLinesCount(): number;
    getTotalRowsCount(): number;
    getFirstRowForLine(lineNumber: number): number;
    getSelectedText(): string;
}
