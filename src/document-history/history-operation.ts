import { Point } from '../selection';

export enum HisotryOperations {
	Insert,
	Delete,
	SwapLines,
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
		switch (this.type) {
			case HisotryOperations.Insert: {
				const op = new HistoryOperation(
					HisotryOperations.Delete,
					this.pos,
					this.endPos,
					this.text,
				);
				return op;
			}
			case HisotryOperations.Delete: {
				const op = new HistoryOperation(
					HisotryOperations.Insert,
					this.pos,
					this.endPos,
					this.text,
				);
				return op;
			}
			case HisotryOperations.SwapLines: {
				const op = new HistoryOperation(
					HisotryOperations.SwapLines,
					this.pos,
					this.endPos,
					'',
				);
				return op;
			}
			default:
				throw new Error('Invalid operation type.');
		}
	}
}
