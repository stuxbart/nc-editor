export function getRelativePositionOfMouseEvent(e: MouseEvent): [number, number] {
	const target = e.target as HTMLDivElement;
	const rect = target.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;
	return [x, y];
}

export function getRelativePositionOfTouchEvent(e: TouchEvent): [number, number] {
	const target = e.target as HTMLDivElement;
	const rect = target.getBoundingClientRect();
	const x = e.touches[0].clientX - rect.left;
	const y = e.touches[0].clientY - rect.top;
	return [x, y];
}
