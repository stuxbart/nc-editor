export default class WrapNode {
    left: WrapNode | null;
    right: WrapNode | null;
    parent: WrapNode | null;
    data: LineWrapData;
    leftSubTreeSize: number;
    leftSubTreeRows: number;
    height: number;
    constructor(data: LineWrapData);
}
export declare class LineWrapData {
    data: number[];
}
export declare class RowWrapData {
    line: number;
    ord: number;
    offset: number;
    constructor(line: number, ord: number, offset: number);
}
