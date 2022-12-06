import { Range } from '../selection';
import DocumentNode from './document-node';
import { nodeHeight } from './utils';

/**
 * Document class is used for storign text data.
 * The class is built on balanced AVL tree.
 */
export default class Document {
	private _rootNode: DocumentNode | null = null;
	private _linesCount: number = 0;

	constructor(text: string) {
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
		if (text.length === 0) {
			return [0, 0];
		}

		if (this._rootNode === null) {
			const newNode = new DocumentNode('');
			this._rootNode = this._insertLine(this._rootNode, newNode, 0);
		}

		const node = this._getNodeByLineNumber(this._rootNode, line);
		if (node === null) {
			return [0, 0];
		}

		const newLines = text.split('\n');
		if (newLines.length === 1) {
			node.text = node.text.slice(0, offset) + text + node.text.slice(offset);
		} else {
			const tmpText = node.text.slice(offset);
			node.text = node.text.slice(0, offset) + newLines[0];
			let newNode: DocumentNode | null = null;
			for (let i = 1; i < newLines.length; i++) {
				const lineContent = newLines[i];
				newNode = new DocumentNode(lineContent);
				this._rootNode = this._insertLine(this._rootNode, newNode, line + i);
			}
			if (newNode !== null) {
				newNode.text += tmpText;
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
		const firstLineNode = this._getNodeByLineNumber(this._rootNode, range.start.line);

		if (firstLineNode === null) {
			return '';
		}

		if (range.start.line === range.end.line) {
			const removedText = firstLineNode.text.slice(range.start.offset, range.end.offset);
			firstLineNode.text =
				firstLineNode.text.slice(0, range.start.offset) +
				firstLineNode.text.slice(range.end.offset);

			return removedText;
		}
		let removedText = firstLineNode.text.slice(range.start.offset);
		firstLineNode.text = firstLineNode.text.slice(0, range.start.offset);
		const linesToDelete = range.end.line - range.start.line - 1;

		for (let i = 0; i < linesToDelete; i++) {
			const nodeToRemove = this._getNodeByLineNumber(this._rootNode, range.start.line + 1);
			if (nodeToRemove === null) {
				return removedText;
			}
			removedText += '\n' + nodeToRemove.text;
			this._rootNode = this._removeLine(this._rootNode, range.start.line + 1);
		}

		const lastLineNode = this._getNodeByLineNumber(this._rootNode, range.start.line + 1);

		if (lastLineNode === null) {
			return removedText;
		}

		removedText += '\n' + lastLineNode.text.slice(0, range.end.offset);
		firstLineNode.text += lastLineNode.text.slice(range.end.offset);
		this._rootNode = this._removeLine(this._rootNode, range.start.line + 1);

		return removedText;
	}

	public get linesCount(): number {
		return this._linesCount;
	}

	public get text(): string {
		return this._getNodeText(this._rootNode);
	}

	public getText(): string {
		return this._getNodeText(this._rootNode);
	}

	public getLines(firstLine: number, linesCount: number): string[] {
		const linesArr: string[] = [];
		this._getLines(this._rootNode, firstLine, linesCount, linesArr);
		return linesArr;
	}

	public getLineNodes(firstLine: number, linesCount: number): DocumentNode[] {
		const nodes: DocumentNode[] = [];

		let currentNode = this._getNodeByLineNumber(this._rootNode, firstLine);

		while (currentNode !== null && nodes.length < linesCount) {
			nodes.push(currentNode);
			currentNode = this._getNextLine(currentNode);
		}
		return nodes;
	}

	public getLine(lineNumber: number): string {
		return this._getNodeByLineNumber(this._rootNode, lineNumber)?.text ?? '';
	}

	public getFirstLine(): string {
		return this._getFirstLine(this._rootNode)?.text ?? '';
	}

	public getLastLine(): string {
		return this._getLastLine(this._rootNode)?.text ?? '';
	}

	public getFirstLineNode(): DocumentNode | null {
		return this._getFirstLine(this._rootNode);
	}

	public getLastLineNode(): DocumentNode | null {
		return this._getLastLine(this._rootNode);
	}

	public removeLine(lineNumber: number): void {
		this._rootNode = this._removeLine(this._rootNode, lineNumber);
		return;
	}

	public insertLineAfter(text: string, lineNumber: number): void {
		const newNode = new DocumentNode(text);
		this._rootNode = this._insertLine(this._rootNode, newNode, lineNumber + 1);
	}

	public insertLineBefore(text: string, lineNumber: number): void {
		const newNode = new DocumentNode(text);
		this._rootNode = this._insertLine(this._rootNode, newNode, lineNumber);
	}

	private _removeLine(node: DocumentNode | null, lineNumber: number): DocumentNode | null {
		if (node === null) {
			return node;
		}

		if (lineNumber < node.leftSubTreeSize) {
			node.left = this._removeLine(node.left, lineNumber);
			node.leftSubTreeSize -= 1;
		} else if (lineNumber > node.leftSubTreeSize) {
			node.right = this._removeLine(node.right, lineNumber - node.leftSubTreeSize - 1);
		} else {
			if (node.left === null || node.right === null) {
				let tmp: DocumentNode | null = null;
				if (tmp === node.left) {
					tmp = node.right;
				} else {
					tmp = node.left;
				}

				if (tmp === null) {
					tmp = node;
					node = null;
				} else {
					tmp.parent = node.parent;
					node = tmp;
				}
				this._linesCount -= 1;
			} else {
				const tmp: DocumentNode | null = this._getFirstLine(node.right);
				node.text = tmp?.text ?? '';

				node.right = this._removeLine(node.right, tmp?.leftSubTreeSize ?? 0);
			}
		}

		if (node === null) {
			return node;
		}

		node.height = Math.max(nodeHeight(node.left), nodeHeight(node.right)) + 1;

		const balance = this._getBalanceFactor(node);

		if (balance > 1 && this._getBalanceFactor(node.left) >= 0) {
			return this._rotateRight(node);
		}

		if (balance > 1 && this._getBalanceFactor(node.left) < 0) {
			if (node.left) {
				node.left = this._rotateLeft(node.left);
			}
			return this._rotateRight(node);
		}

		if (balance < -1 && this._getBalanceFactor(node.right) <= 0) {
			return this._rotateLeft(node);
		}

		if (balance < -1 && this._getBalanceFactor(node.right) > 0) {
			if (node.right) {
				node.right = this._rotateRight(node.right);
			}
			return this._rotateLeft(node);
		}

		return node;
	}

	private _getLines(
		node: DocumentNode | null,
		firstLineNumber: number,
		linesCount: number,
		linesArr: string[],
	): void {
		if (node === null) {
			return;
		}
		let currentNode = this._getNodeByLineNumber(node, firstLineNumber);

		while (currentNode !== null && linesArr.length < linesCount) {
			linesArr.push(currentNode.text);
			currentNode = this._getNextLine(currentNode);
		}
		return;
	}

	private _getNextLine(node: DocumentNode): DocumentNode | null {
		if (node.right != null) {
			return this._getFirstLine(node.right);
		}

		let parent = node.parent;
		while (parent !== null && node === parent.right) {
			node = parent;
			parent = parent.parent;
		}
		return parent;
	}

	private _getFirstLine(node: DocumentNode | null): DocumentNode | null {
		if (node === null) {
			return null;
		}
		let current = node;

		while (current.left !== null) {
			current = current.left;
		}
		return current;
	}

	private _getLastLine(node: DocumentNode | null): DocumentNode | null {
		if (node === null) {
			return null;
		}
		let current = node;

		while (current.right != null) {
			current = current.right;
		}
		return current;
	}

	private _getNodeByLineNumber(
		node: DocumentNode | null,
		lineNumber: number,
	): DocumentNode | null {
		if (node === null) {
			return node;
		}

		if (lineNumber === node.leftSubTreeSize) {
			return node;
		} else if (lineNumber < node.leftSubTreeSize) {
			return this._getNodeByLineNumber(node.left, lineNumber);
		} else {
			return this._getNodeByLineNumber(node.right, lineNumber - node.leftSubTreeSize - 1);
		}
	}

	private _getNodeText(node: DocumentNode | null): string {
		if (node === null) {
			return '';
		}
		let returnString = '';
		if (node.left !== null) {
			returnString += this._getNodeText(node.left) + '\n';
		}
		returnString += node.text;

		if (node.right !== null) {
			returnString += '\n' + this._getNodeText(node.right);
		}
		return returnString;
	}

	private _insertLine(
		node: DocumentNode | null,
		insertNode: DocumentNode,
		lineNumber: number,
	): DocumentNode {
		if (node === null) {
			this._linesCount += 1;
			return insertNode;
		}

		if (lineNumber <= node.leftSubTreeSize) {
			node.left = this._insertLine(node.left, insertNode, lineNumber);
			node.left.parent = node;
			node.leftSubTreeSize += 1;
		} else {
			node.right = this._insertLine(
				node.right,
				insertNode,
				lineNumber - node.leftSubTreeSize - 1,
			);
			node.right.parent = node;
		}

		node.height = 1 + Math.max(nodeHeight(node.left), nodeHeight(node.right));

		const balance = this._getBalanceFactor(node);

		if (balance > 1 && lineNumber < (node.left?.leftSubTreeSize ?? 0)) {
			return this._rotateRight(node);
		}

		if (
			balance < -1 &&
			lineNumber - node.leftSubTreeSize - 1 > (node.right?.leftSubTreeSize ?? 0)
		) {
			return this._rotateLeft(node);
		}

		if (balance > 1 && node.left && lineNumber > node.left.leftSubTreeSize) {
			node.left = this._rotateLeft(node.left);
			return this._rotateRight(node);
		}

		if (
			balance < -1 &&
			node.right &&
			lineNumber - node.leftSubTreeSize - 1 < node.right.leftSubTreeSize
		) {
			node.right = this._rotateRight(node.right);
			return this._rotateLeft(node);
		}

		return node;
	}

	private _getBalanceFactor(node: DocumentNode | null): number {
		if (node === null) {
			return 0;
		}

		return nodeHeight(node.left) - nodeHeight(node.right);
	}

	private _rotateLeft(node: DocumentNode): DocumentNode {
		//   node              y
		//    /\              /\
		//  N1  y     ->   node  N3
		//      /\          /\
		//    N2  N3      N1  N2
		const y = node.right;
		if (y === null) {
			return node;
		}
		const N2 = y.left;

		y.left = node;
		node.right = N2;

		node.height = Math.max(nodeHeight(node.left), nodeHeight(node.right)) + 1;
		y.height = Math.max(nodeHeight(y.left), nodeHeight(y.right)) + 1;

		y.leftSubTreeSize = y.leftSubTreeSize + node.leftSubTreeSize + 1;
		y.parent = node.parent;
		node.parent = y;
		if (N2 !== null) {
			N2.parent = node;
		}
		return y;
	}

	private _rotateRight(node: DocumentNode): DocumentNode {
		//      node            x
		//       /\            /\
		//      x  N3   ->   N1 node
		//     /\                 /\
		//   N1  N2             N2  N3
		const x = node.left;
		if (x === null) {
			return node;
		}
		const N2 = x.right;

		x.right = node;
		node.left = N2;

		node.height = Math.max(nodeHeight(node.left), nodeHeight(node.right)) + 1;
		x.height = Math.max(nodeHeight(x.left), nodeHeight(x.right)) + 1;

		node.leftSubTreeSize = node.leftSubTreeSize - x.leftSubTreeSize - 1;
		x.parent = node.parent;
		node.parent = x;
		if (N2 !== null) {
			N2.parent = node;
		}
		return x;
	}
}
