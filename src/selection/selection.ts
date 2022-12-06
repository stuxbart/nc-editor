import Range from './range';
import { samePoint } from './utils';

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
}
