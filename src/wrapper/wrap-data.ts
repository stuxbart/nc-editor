import { Point } from '../selection';
import WrapNode, { LineWrapData, RowWrapData } from './wrap-node';

export const nodeHeight = (node: WrapNode | null): number => (node === null ? 0 : node.height);

export default class WrapData {
	private _rootNode: WrapNode | null = null;
	private _linesCount: number = 0;
	private _rowsCount: number = 0;
	public maxRowLength: number = 0;

	public get linesCount(): number {
		return this._linesCount;
	}

	public get rowsCount(): number {
		return this._rowsCount;
	}

	public clear(): void {
		this._rootNode = null;
		this._linesCount = 0;
		this._rowsCount = 0;
	}

	public insertLine(data: LineWrapData, lineNumber: number): void {
		const newNode = new WrapNode(data);
		this._rootNode = this._insertLine(this._rootNode, newNode, lineNumber, data.data.length);
	}

	public updateLineData(data: LineWrapData, lineNumber: number): void {
		const [, line] = this._getNodeByLineNumber(this._rootNode, lineNumber);
		if (line === null) {
			return;
		}
		const prevData = line.data;
		this._rootNode = this._removeLine(this._rootNode, lineNumber, prevData.data.length);
		this._rootNode = this._insertLine(
			this._rootNode,
			new WrapNode(data),
			lineNumber,
			data.data.length,
		);
	}

	public getDataForLines(firstLine: number, linesCount: number): LineWrapData[] {
		const linesArr: LineWrapData[] = [];
		this._getLines(this._rootNode, firstLine, linesCount, linesArr);
		return linesArr;
	}

	public getRows(firstRow: number, rowsCount: number): RowWrapData[] {
		const rowsArr: RowWrapData[] = [];
		this._getRows(this._rootNode, firstRow, rowsCount, rowsArr);
		return rowsArr;
	}

	public getLineData(lineNumber: number): LineWrapData {
		const [, node] = this._getNodeByLineNumber(this._rootNode, lineNumber);
		return node?.data ?? { data: [] };
	}

	public getFirstLineData(): LineWrapData {
		return this._getFirstLine(this._rootNode)?.data ?? { data: [] };
	}

	public getLastLineData(): LineWrapData {
		return this._getLastLine(this._rootNode)?.data ?? { data: [] };
	}

	public removeLine(lineNumber: number): void {
		const [, lineToRemove] = this._getNodeByLineNumber(this._rootNode, lineNumber);
		this._rootNode = this._removeLine(
			this._rootNode,
			lineNumber,
			lineToRemove?.data.data.length ?? 0,
		);
		return;
	}

	public swapLineWithNext(lineNumber: number): void {
		const [, firstLine] = this._getNodeByLineNumber(this._rootNode, lineNumber);
		if (firstLine === null) {
			return;
		}
		const nextLine = this._getNextLine(firstLine);
		if (nextLine === null) {
			return;
		}
		const firstWrapdata = firstLine.data;
		const nextWrapdata = nextLine.data;
		this._rootNode = this._removeLine(this._rootNode, lineNumber, firstWrapdata.data.length);
		this._rootNode = this._removeLine(this._rootNode, lineNumber, nextWrapdata.data.length);
		const newLine1 = new WrapNode(nextWrapdata);
		const newLine2 = new WrapNode(firstWrapdata);
		this._rootNode = this._insertLine(
			this._rootNode,
			newLine1,
			lineNumber,
			newLine1.data.data.length,
		);
		this._rootNode = this._insertLine(
			this._rootNode,
			newLine2,
			lineNumber + 1,
			newLine2.data.data.length,
		);
	}

	public swapLineWithPrevious(lineNumber: number): void {
		return this.swapLineWithNext(lineNumber - 1);
	}

	public getFirstRowForLine(linenumber: number): number {
		const [row] = this._getNodeByLineNumber(this._rootNode, linenumber);
		return row;
	}

	public getRowNumberAtPosition(pos: Point): number {
		const [row, node] = this._getNodeByLineNumber(this._rootNode, pos.line);
		if (node === null) {
			return -1;
		}
		let i = 0;
		for (; i < node.data.data.length; i++) {
			const offset = node.data.data[i];
			if (pos.offset < offset) {
				return row + i;
			}
		}
		return row + node.data.data.length - 1;
	}

	private _removeLine(
		node: WrapNode | null,
		lineNumber: number,
		lineSize: number,
	): WrapNode | null {
		if (node === null) {
			return node;
		}

		if (lineNumber < node.leftSubTreeSize) {
			node.left = this._removeLine(node.left, lineNumber, lineSize);
			node.leftSubTreeSize -= 1;
			node.leftSubTreeRows -= lineSize;
		} else if (lineNumber > node.leftSubTreeSize) {
			node.right = this._removeLine(
				node.right,
				lineNumber - node.leftSubTreeSize - 1,
				lineSize,
			);
		} else {
			if (node.left === null || node.right === null) {
				let tmp: WrapNode | null = null;
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
				this._rowsCount -= lineSize;
			} else {
				const tmp: WrapNode | null = this._getFirstLine(node.right);
				node.data = tmp?.data ?? { data: [] };

				node.right = this._removeLine(node.right, tmp?.leftSubTreeSize ?? 0, lineSize);
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

	private _getRows(
		node: WrapNode | null,
		firstRowNumber: number,
		rowsCount: number,
		rowsArr: RowWrapData[],
	): void {
		if (node === null) {
			return;
		}
		const nodeData = this._getNodeByRowNumber(node, firstRowNumber, 0, 0);
		const rowNumber = nodeData[1];
		let lineNumber = nodeData[0];
		let currentNode = nodeData[2];
		while (currentNode !== null && rowsArr.length < rowsCount) {
			const lineBreaks = currentNode.data.data;
			const startIndex = rowsArr.length === 0 ? firstRowNumber - rowNumber : 0;
			for (let i = startIndex; i < lineBreaks.length && rowsArr.length < rowsCount; i++) {
				const rowData = new RowWrapData(lineNumber, i, lineBreaks[i]);
				rowsArr.push(rowData);
			}
			currentNode = this._getNextLine(currentNode);
			lineNumber++;
		}
		return;
	}

	private _getLines(
		node: WrapNode | null,
		firstLineNumber: number,
		linesCount: number,
		linesArr: LineWrapData[],
	): void {
		if (node === null) {
			return;
		}
		let [, currentNode] = this._getNodeByLineNumber(node, firstLineNumber);

		while (currentNode !== null && linesArr.length < linesCount) {
			linesArr.push(currentNode.data);
			currentNode = this._getNextLine(currentNode);
		}
		return;
	}

	private _getNextLine(node: WrapNode): WrapNode | null {
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

	private _getFirstLine(node: WrapNode | null): WrapNode | null {
		if (node === null) {
			return null;
		}
		let current = node;

		while (current.left !== null) {
			current = current.left;
		}
		return current;
	}

	private _getLastLine(node: WrapNode | null): WrapNode | null {
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
		node: WrapNode | null,
		lineNumber: number,
		rowOffset: number = 0,
	): [number, WrapNode | null] {
		if (node === null) {
			return [rowOffset, node];
		}

		if (lineNumber === node.leftSubTreeSize) {
			return [rowOffset + node.leftSubTreeRows, node];
		} else if (lineNumber < node.leftSubTreeSize) {
			return this._getNodeByLineNumber(node.left, lineNumber, rowOffset);
		} else {
			return this._getNodeByLineNumber(
				node.right,
				lineNumber - node.leftSubTreeSize - 1,
				rowOffset + node.leftSubTreeRows + node.data.data.length,
			);
		}
	}

	private _getNodeByRowNumber(
		node: WrapNode | null,
		rowNumber: number,
		lineOffset: number,
		rowOffset: number,
	): [number, number, WrapNode | null] {
		if (node === null) {
			return [lineOffset, rowOffset, node];
		}

		if (
			rowNumber >= node.leftSubTreeRows &&
			rowNumber < node.leftSubTreeRows + node.data.data.length
		) {
			return [lineOffset + node.leftSubTreeSize, rowOffset + node.leftSubTreeRows, node];
		} else if (rowNumber < node.leftSubTreeRows) {
			return this._getNodeByRowNumber(node.left, rowNumber, lineOffset, rowOffset);
		} else {
			return this._getNodeByRowNumber(
				node.right,
				rowNumber - node.leftSubTreeRows - node.data.data.length,
				lineOffset + node.leftSubTreeSize + 1,
				rowOffset + node.leftSubTreeRows + node.data.data.length,
			);
		}
	}

	private _insertLine(
		node: WrapNode | null,
		insertNode: WrapNode,
		lineNumber: number,
		lineSize: number,
	): WrapNode {
		if (node === null) {
			this._linesCount += 1;
			this._rowsCount += lineSize;
			return insertNode;
		}

		if (lineNumber <= node.leftSubTreeSize) {
			node.left = this._insertLine(node.left, insertNode, lineNumber, lineSize);
			node.left.parent = node;
			node.leftSubTreeSize += 1;
			node.leftSubTreeRows += lineSize;
		} else {
			node.right = this._insertLine(
				node.right,
				insertNode,
				lineNumber - node.leftSubTreeSize - 1,
				lineSize,
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

	private _getBalanceFactor(node: WrapNode | null): number {
		if (node === null) {
			return 0;
		}

		return nodeHeight(node.left) - nodeHeight(node.right);
	}

	private _rotateLeft(node: WrapNode): WrapNode {
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
		y.leftSubTreeRows = y.leftSubTreeRows + node.leftSubTreeRows + node.data.data.length;
		y.parent = node.parent;
		node.parent = y;
		if (N2 !== null) {
			N2.parent = node;
		}
		return y;
	}

	private _rotateRight(node: WrapNode): WrapNode {
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
		node.leftSubTreeRows = node.leftSubTreeRows - x.leftSubTreeRows - x.data.data.length;
		x.parent = node.parent;
		node.parent = x;
		if (N2 !== null) {
			N2.parent = node;
		}
		return x;
	}
}
