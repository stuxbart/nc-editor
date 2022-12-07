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

export function getWordBefore(text: string, offset: number): string {
	if (offset > text.length) {
		offset = text.length;
	}
	const char = text[offset - 1];
	if (isWhiteSpaceChar(char)) {
		const length = readWhiteSpaceBefore(text, offset);
		return text.substring(offset - length, offset);
	} else if (isAlpha(char)) {
		const length = readWordBefore(text, offset);
		return text.substring(offset - length, offset);
	} else if (isNumeric(char)) {
		const length = readNumberBefore(text, offset);
		return text.substring(offset - length, offset);
	} else {
		return text.substring(offset - 1, offset);
	}
}

export function isWhiteSpaceChar(char: string): boolean {
	return char === ' ' || char === '\t';
}

export function isAlpha(char: string): boolean {
	return /[_a-zA-Z]/.test(char);
}

export function isNumeric(char: string): boolean {
	return /^[0-9]+$/i.test(char);
}

export function isAlphaNumeric(char: string): boolean {
	return /^[_a-zA-Z0-9]+$/i.test(char);
}

export function readWhiteSpaceBefore(text: string, offset: number): number {
	let i = offset - 1;
	let char = text[i];
	while (i > -1 && isWhiteSpaceChar(char)) {
		i--;
		char = text[i];
	}
	return offset - i - 1;
}

export function readWordBefore(text: string, offset: number): number {
	let i = offset - 1;
	let char = text[i];
	while (i > -1 && isAlpha(char)) {
		i--;
		char = text[i];
	}
	return offset - i - 1;
}

export function readNumberBefore(text: string, offset: number): number {
	let i = offset - 1;
	let char = text[i];
	while (i > -1 && isNumeric(char)) {
		i--;
		char = text[i];
	}
	return offset - i - 1;
}
