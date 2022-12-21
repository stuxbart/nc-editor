import { Point } from '../selection';
export declare enum HisotryOperations {
    Insert = 0,
    Delete = 1,
    SwapLines = 2
}
export default class HistoryOperation {
    type: HisotryOperations;
    pos: Point;
    endPos: Point;
    text: string;
    constructor(type: HisotryOperations, pos: Point, endPos: Point, text: string);
    getReverse(): HistoryOperation;
}
