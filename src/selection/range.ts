import Point from './point';

export default class Range {
	public start: Point;
	public end: Point;

	constructor(
		startLine: number = 0,
		startOffset: number = 0,
		endLine: number = 0,
		endOffset: number = 0,
	) {
		this.start = new Point(startLine, startOffset);
		this.end = new Point(endLine, endOffset);
	}
}
