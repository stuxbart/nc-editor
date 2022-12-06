export default class Editor {
	constructor(root: HTMLElement) {
		const div = document.createElement('div');
		div.innerText = 'nc-editor';
		root.appendChild(div);
	}
}
