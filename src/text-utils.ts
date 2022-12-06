export function removeAccents(text: string): string {
	return text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // get rid of accents
		.replace('ł', 'l'); // doesnt work for ł
}

export function columnToOffset(line: string, column: number, tabSize: number = 8): number {
	let offset: number = 0;
	while (offset < line.length && column > 0) {
		if (line[offset++] === '\t') {
			column -= tabSize;
		} else {
			column -= 1;
		}
	}
	if (column > 0) {
		return line.length;
	}
	if (column < -tabSize / 2) {
		return offset - 1;
	}
	return offset;
}

export function offsetToColumn(line: string, offset: number, tabSize: number = 8): number {
	let column: number = 0;
	for (let i = 0; i < offset; i++) {
		const char = line[i];
		if (char === '\t') {
			column += tabSize;
		} else {
			column += 1;
		}
	}
	return column;
}
