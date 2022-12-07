import Point from './point';
import Range from './range';
import { pointCompare, samePoint } from './utils';

export enum SelectionType {
	N,
	L,
	R,
}

export default class Selection extends Range {
	public type: SelectionType = SelectionType.N;

	public get isCollapsed(): boolean {
		return samePoint(this.start, this.end);
	}

	public updateSelection(point: Point): void {
		if (this.type === SelectionType.L) {
			const cmpRes = pointCompare(this.end, point);
			if (cmpRes === 1) {
				this.start = point;
			} else {
				this.type = SelectionType.R;
				this.start = this.end;
				this.end = point;
			}
		} else if (this.type === SelectionType.R) {
			const cmpRes = pointCompare(this.start, point);
			if (cmpRes === 2) {
				this.end = point;
			} else {
				this.type = SelectionType.L;
				this.end = this.start;
				this.start = point;
			}
		} else {
			const cmpRes = pointCompare(this.start, point);
			if (cmpRes === 2) {
				this.type = SelectionType.R;
				this.end = point;
			} else {
				this.type = SelectionType.L;
				this.start = point;
			}
		}
	}

	public toString(): string {
		return `{start: {l: ${this.start.line}, o:${this.start.offset}}, end: {l: ${this.end.line}, o:${this.end.offset}}}`;
	}
}
