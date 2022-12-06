/**
 * Base element used to build Document tree structure.
 * One Node represent one line of text in document.
 */
export default class DocumentNode {
	public left: DocumentNode | null = null;
	public right: DocumentNode | null = null;
	public parent: DocumentNode | null = null;
	public text: string = '';
	public leftSubTreeSize: number = 0;
	public height: number = 1;

	constructor(text: string = '') {
		this.text = text;
	}
}
