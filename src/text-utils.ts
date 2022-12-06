export function removeAccents(text: string): string {
	return text
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // get rid of accents
		.replace('ł', 'l'); // doesnt work for ł
}
