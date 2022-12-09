export const createTextArea = (className: string = ''): HTMLTextAreaElement => {
	const input = createElement('textarea') as HTMLTextAreaElement;
	input.className = className;
	return input;
};

export const createElement = (type: string): HTMLElement => {
	return document.createElement(type);
};

export const createDiv = (className: string = ''): HTMLDivElement => {
	const div = createElement('div') as HTMLDivElement;
	div.className = className;
	return div;
};
export const createNodeFromTemplate = (text: string): ChildNode | null => {
	const template = createElement('template') as HTMLTemplateElement;
	template.innerHTML = text;
	return template.content.firstChild;
};

export const isChildOf = (parent: Node | null, element: Node): boolean => {
	let currentNode: Node | null = element;
	while (currentNode) {
		if (currentNode === parent) {
			return true;
		}
		currentNode = currentNode.parentNode;
	}
	return false;
};

export const px = (val: number): string => `${val}px`;
export const rem = (val: number): string => `${val}rem`;
export const em = (val: number): string => `${val}em`;
