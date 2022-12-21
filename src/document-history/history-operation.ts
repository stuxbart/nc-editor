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
}
