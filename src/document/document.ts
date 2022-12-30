import { Range } from '../selection';
import Tree from '../tree/tree';
import TreeNode from '../tree/tree-node';

/**
 * Document class is used for storign text data.
 * The class is built on balanced AVL tree.
 */
export default class Document {
	private _tree: Tree<string>;

	constructor(text: string) {
		this._tree = new Tree<string>();
		this.insert(text, 0, 0);
	}
	/**
	 * Insert text at given position. If given line doesn't exist nothing is inserted.
	 * Insetring text after line end will append this text to the line.
	 * @param text text to be inserted
	 * @param line line where insert start
	 * @param offset offset relative to line start
	 * @returns count of inserted new lines, length of last inserted line
	 */
	public insert(text: string, line: number, offset: number): [number, number] {
		if (text.length === 0 && !this._tree.isEmpty) {
			return [0, 0];
		}

		if (this._tree.isEmpty) {
			this._tree.insert('', 0);
		}

		const node = this._tree.getNode(line);
		if (node === null) {
			return [0, 0];
		}

		const newLines = text.split(/\r?\n|\r/g);
		if (newLines.length === 1) {
			node.data = node.data.slice(0, offset) + text + node.data.slice(offset);
		} else {
			const tmpText = node.data.slice(offset);
			node.data = node.data.slice(0, offset) + newLines[0];
			let newNode: TreeNode<string> | null = null;
			for (let i = 1; i < newLines.length; i++) {
				const lineContent = newLines[i];
				newNode = this._tree.insert(lineContent, line + i);
			}
			if (newNode !== null) {
				newNode.data += tmpText;
			}
		}

		return [newLines.length - 1, newLines[newLines.length - 1].length];
	}
	/**
	 * Remove text from document, if range does not start in document bounds nothing is deleted.
	 * If range ends after document ends remove only existing text.
	 * @param range range of text in document that should be deleted
	 * @returns text removed from document
	 */
	public remove(range: Range): string {
		const firstLineNode = this._tree.getNode(range.start.line);

		if (firstLineNode === null) {
			return '';
		}

		if (range.start.line === range.end.line) {
			const removedText = firstLineNode.data.slice(range.start.offset, range.end.offset);
			firstLineNode.data =
				firstLineNode.data.slice(0, range.start.offset) +
				firstLineNode.data.slice(range.end.offset);

			return removedText;
		}
		let removedText = firstLineNode.data.slice(range.start.offset);
		firstLineNode.data = firstLineNode.data.slice(0, range.start.offset);
		const linesToDelete = range.end.line - range.start.line - 1;

		for (let i = 0; i < linesToDelete; i++) {
			const nodeToRemove = this._tree.getNode(range.start.line + 1);
			if (nodeToRemove === null) {
				return removedText;
			}
			removedText += '\n' + nodeToRemove.data;
			this._tree.removeNode(range.start.line + 1);
		}

		const lastLineNode = this._tree.getNode(range.start.line + 1);

		if (lastLineNode === null) {
			return removedText;
		}

		removedText += '\n' + lastLineNode.data.slice(0, range.end.offset);
		firstLineNode.data += lastLineNode.data.slice(range.end.offset);
		this._tree.removeNode(range.start.line + 1);

		return removedText;
	}

	public get linesCount(): number {
		return this._tree.nodesCount;
	}

	public get text(): string {
		return this.getText(new Range(0, 0, Infinity, Infinity));
	}

	public getText(range: Range): string {
		const firstLineNode = this._tree.getNode(range.start.line);
		if (firstLineNode === null) {
			return '';
		}
		if (range.start.line === range.end.line) {
			const text = firstLineNode.data.substring(range.start.offset, range.end.offset);
			return text;
		}
		let text = firstLineNode.data.substring(range.start.offset);
		const linesCount = range.end.line - range.start.line;
		const lines: string[] = this._tree.getNodesData(range.start.line + 1, linesCount);

		for (let i = 0; i < linesCount - 1; i++) {
			text += '\n' + lines[i];
		}

		text += '\n' + lines[lines.length - 1].substring(0, range.end.offset);
		return text;
	}

	public getLines(firstLine: number, linesCount: number): string[] {
		return this._tree.getNodesData(firstLine, linesCount);
	}

	public getLine(lineNumber: number): string {
		return this._tree.getData(lineNumber);
	}

	public getFirstLine(): string {
		return this._tree.getFirstNodeData() ?? '';
	}

	public getLastLine(): string {
		return this._tree.getLastNodeData() ?? '';
	}

	public removeLine(lineNumber: number): void {
		this._tree.removeNode(lineNumber);
		return;
	}

	public insertLineAfter(text: string, lineNumber: number): void {
		this._tree.insert(text, lineNumber + 1);
	}

	public insertLineBefore(text: string, lineNumber: number): void {
		this._tree.insert(text, lineNumber);
	}

	public swapLineWithNext(lineNumber: number): void {
		this._tree.swapNodeWithNext(lineNumber);
	}

	public swapLineWithPrevious(lineNumber: number): void {
		return this._tree.swapNodeWithNext(lineNumber - 1);
	}
}
