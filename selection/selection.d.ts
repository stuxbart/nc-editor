import Point from './point';
import Range from './range';
export declare enum SelectionType {
    N = 0,
    L = 1,
    R = 2
}
export default class Selection extends Range {
    type: SelectionType;
    get isCollapsed(): boolean;
    updateSelection(point: Point): void;
    toString(): string;
    overlaps(other: Selection): boolean;
}
