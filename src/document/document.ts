import DocumentNode from './document-node';

/**
 * Document class is used for storign text data.
 * The class is built on balanced AVL tree.
 */
export default class Document {
	private _rootNode: DocumentNode | null = null;
	private _linesCount: number = 0;

	constructor(text: string) {
		this.insert(text);
	}

	public insert(text: string): string {
		return text;
	}

	public remove(text: string): string {
		return text;
	}
}
