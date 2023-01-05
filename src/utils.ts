const IDS_REGISTRY: string[] = [];

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
	return value !== null && value !== undefined;
}

export function randomString(length: number = 6): string {
	let id = '';
	const availableChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	for (let i = 0; i < length; i++) {
		id += availableChars[Math.floor(Math.random() * availableChars.length)];
	}
	return id;
}

export function randomId(length: number = 6): string {
	let id = '';
	do {
		id = randomString(length);
	} while (IDS_REGISTRY.includes(id));
	IDS_REGISTRY.push(id);
	return id;
}

export function debounce(fn: (...args: any) => any, delay: number = 100): (...args: any) => void {
	let timeout: NodeJS.Timeout | null = null;

	return (...args: Parameters<typeof fn>) => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		timeout = setTimeout(() => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			fn(...args);
		}, delay);
	};
}
