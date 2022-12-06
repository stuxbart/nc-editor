import Point from './point';

export const samePoint = (p1: Point, p2: Point): boolean =>
	p1.line === p2.line && p1.offset === p2.offset;
