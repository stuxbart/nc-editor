export function removeAccents(text: string): string {
	return text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // get rid of accents
		.replace(/ł/g, 'l'); // doesnt work for ł
}

export function columnToOffset(line: string, column: number, tabSize: number = 8): number {
	let offset: number = 0;
	let readedColumns: number = 0;
	while (offset < line.length && column > 0) {
		if (line[offset++] === '\t') {
			const r = readedColumns % tabSize;
			column -= tabSize - r;
			readedColumns += tabSize - r;
		} else {
			column -= 1;
			readedColumns += 1;
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
			const r = column % tabSize;
			column += tabSize - r;
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
	if (offset < 0) {
		return '';
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

export function getWordAfter(text: string, offset: number): string {
	if (offset > text.length) {
		return '';
	}
	if (offset < 0) {
		offset = 0;
	}
	const char = text[offset];
	if (isWhiteSpaceChar(char)) {
		const length = readWhiteSpaceAfter(text, offset);
		return text.substring(offset, offset + length);
	} else if (isAlpha(char)) {
		const length = readWordAfter(text, offset);
		return text.substring(offset, offset + length);
	} else if (isNumeric(char)) {
		const length = readNumberAfter(text, offset);
		return text.substring(offset, offset + length);
	} else {
		return text.substring(offset, offset + 1);
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
	return readBeforeUntil(text, offset, isWhiteSpaceChar);
}

export function readWordBefore(text: string, offset: number): number {
	return readBeforeUntil(text, offset, isAlpha);
}

export function readNumberBefore(text: string, offset: number): number {
	return readBeforeUntil(text, offset, isNumeric);
}

export function readBeforeUntil(text: string, offset: number, fn: Function): number {
	let i = offset - 1;
	let char = text[i];
	while (i > -1 && fn(char)) {
		i--;
		char = text[i];
	}
	return offset - i - 1;
}

export function readWhiteSpaceAfter(text: string, offset: number): number {
	return readAfterUntil(text, offset, isWhiteSpaceChar);
}

export function readWordAfter(text: string, offset: number): number {
	return readAfterUntil(text, offset, isAlpha);
}

export function readNumberAfter(text: string, offset: number): number {
	return readAfterUntil(text, offset, isNumeric);
}

export function readAfterUntil(text: string, offset: number, fn: Function): number {
	let i = offset;
	let char = text[i];
	while (i < text.length && fn(char)) {
		i++;
		char = text[i];
	}
	return i - offset;
}

export function getLineIndent(text: string): string {
	if (text.length < 1) {
		return '';
	}
	if (text.startsWith(' ')) {
		const length = readAfterUntil(text, 0, (char: string) => char === ' ');
		return text.substring(0, length);
	}
	if (text.startsWith('\t')) {
		const length = readAfterUntil(text, 0, (char: string) => char === '\t');
		return text.substring(0, length);
	}
	return '';
}
