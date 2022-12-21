import { Point } from '../selection';

export enum HisotryOperations {
	Insert,
	Delete,
}

export default class HistoryOperation {
	public type: HisotryOperations;
	public pos: Point;
	public endPos: Point;
	public text: string;

	constructor(type: HisotryOperations, pos: Point, endPos: Point, text: string) {
		this.type = type;
		this.pos = pos;
		this.endPos = endPos;
		this.text = text ? text : '';
	}

	public getReverse(): HistoryOperation {
		if (this.type === HisotryOperations.Insert) {
			const op = new HistoryOperation(
				HisotryOperations.Delete,
				this.pos,
				this.endPos,
				this.text,
			);
			return op;
		} else {
			const op = new HistoryOperation(
				HisotryOperations.Insert,
				this.pos,
				this.endPos,
				this.text,
			);
			return op;
		}
	}
}
