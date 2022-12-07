import Point from './point';

export const samePoint = (p1: Point, p2: Point): boolean =>
	p1.line === p2.line && p1.offset === p2.offset;

/**
 * Return:
 * 0 if points are equal
 * 1 if first point is greater
 * 2 if second point is greater
 * greater - later in text
 */
export const pointCompare = (p1: Point, p2: Point): number => {
	if (p1.line === p2.line) {
		if (p1.offset < p2.offset) {
			return 2;
		} else if (p1.offset === p2.offset) {
			return 0;
		}
		return 1;
	} else if (p1.line < p2.line) {
		return 2;
	}
	return 1;
};
