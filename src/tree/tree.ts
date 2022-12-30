import TreeNode from './tree-node';
import { nodeHeight } from './utils';

/**
 * Generic AVL tree.
 */
export default class Tree<T> {
	private _rootNode: TreeNode<T> | null = null;
	private _nodesCount: number = 0;

	public get nodesCount(): number {
		return this._nodesCount;
	}

	public get isEmpty(): boolean {
		return this._rootNode === null;
	}

	public clear(): void {
		this._nodesCount = 0;
		this._rootNode = null;
	}

	public getNodesData(firstNodeNumber: number, nodesCount: number): T[] {
		const dataArr: T[] = [];
		this._getNodesData(this._rootNode, firstNodeNumber, nodesCount, dataArr);
		return dataArr;
	}

	public getNodes(firstNodeNumber: number, nodesCount: number): TreeNode<T>[] {
		const nodes: TreeNode<T>[] = [];

		let currentNode: TreeNode<T> | null = this._getNodeByNumber(
			this._rootNode,
			firstNodeNumber,
		);

		while (currentNode !== null && nodes.length < nodesCount) {
			nodes.push(currentNode);
			currentNode = this._getNextNode(currentNode);
		}
		return nodes;
	}

	public getNode(nodeNumber: number): TreeNode<T> | null {
		return this._getNodeByNumber(this._rootNode, nodeNumber);
	}

	public getData(nodeNumber: number): T {
		return this._getNodeByNumber(this._rootNode, nodeNumber).data;
	}

	public getFirstNodeData(): T | null {
		return this._getFirstNodeNumber(this._rootNode)?.data ?? null;
	}

	public getLastNodeData(): T | null {
		return this._getLastNode(this._rootNode)?.data ?? null;
	}

	public getFirstNode(): TreeNode<T> | null {
		return this._getFirstNodeNumber(this._rootNode);
	}

	public getLastNode(): TreeNode<T> | null {
		return this._getLastNode(this._rootNode);
	}

	public removeNode(nodeNumber: number): void {
		this._rootNode = this._removeNode(this._rootNode, nodeNumber);
		return;
	}

	public insert(data: T, nodeNumber: number): TreeNode<T> {
		const newNode = new TreeNode<T>(data);
		this._rootNode = this._insertNode(this._rootNode, newNode, nodeNumber);
		return newNode;
	}

	public swapNodeWithNext(nodeNumber: number): void {
		const firstNodeNumber = this._getNodeByNumber(this._rootNode, nodeNumber);

		const nextNode = this._getNextNode(firstNodeNumber);
		if (nextNode === null) {
			return;
		}
		const tmpText = nextNode.data;
		nextNode.data = firstNodeNumber.data;
		firstNodeNumber.data = tmpText;
	}

	public swapNodeWithPrevious(nodeNumber: number): void {
		return this.swapNodeWithNext(nodeNumber - 1);
	}

	private _removeNode(node: TreeNode<T> | null, nodeNumber: number): TreeNode<T> | null {
		if (node === null) {
			return node;
		}

		if (nodeNumber < node.leftSubTreeSize) {
			node.left = this._removeNode(node.left, nodeNumber);
			node.leftSubTreeSize -= 1;
		} else if (nodeNumber > node.leftSubTreeSize) {
			node.right = this._removeNode(node.right, nodeNumber - node.leftSubTreeSize - 1);
		} else {
			if (node.left === null || node.right === null) {
				let tmp: TreeNode<T> | null = null;
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
				this._nodesCount -= 1;
			} else {
				const tmp: TreeNode<T> | null = this._getFirstNodeNumber(node.right);
				if (tmp) {
					node.data = tmp.data;
					node.right = this._removeNode(node.right, tmp.leftSubTreeSize);
				} else {
					throw new Error('Tree error');
				}
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

	private _getNodesData(
		node: TreeNode<T> | null,
		firstNodeNumber: number,
		nodesCount: number,
		dataArr: T[],
	): void {
		if (node === null) {
			return;
		}
		let currentNode: TreeNode<T> | null = this._getNodeByNumber(node, firstNodeNumber);

		while (currentNode !== null && dataArr.length < nodesCount) {
			dataArr.push(currentNode.data);
			currentNode = this._getNextNode(currentNode);
		}
		return;
	}

	private _getNextNode(node: TreeNode<T>): TreeNode<T> | null {
		if (node.right != null) {
			return this._getFirstNodeNumber(node.right);
		}

		let parent = node.parent;
		while (parent !== null && node === parent.right) {
			node = parent;
			parent = parent.parent;
		}
		return parent;
	}

	private _getFirstNodeNumber(node: TreeNode<T> | null): TreeNode<T> | null {
		if (node === null) {
			return null;
		}
		let current = node;

		while (current.left !== null) {
			current = current.left;
		}
		return current;
	}

	private _getLastNode(node: TreeNode<T> | null): TreeNode<T> | null {
		if (node === null) {
			return null;
		}
		let current = node;

		while (current.right != null) {
			current = current.right;
		}
		return current;
	}

	private _getNodeByNumber(node: TreeNode<T> | null, nodeNumber: number): TreeNode<T> {
		if (node === null) {
			throw new Error("Node with given number doesn't exist.");
		}

		if (nodeNumber === node.leftSubTreeSize) {
			return node;
		} else if (nodeNumber < node.leftSubTreeSize) {
			return this._getNodeByNumber(node.left, nodeNumber);
		} else {
			return this._getNodeByNumber(node.right, nodeNumber - node.leftSubTreeSize - 1);
		}
	}

	private _insertNode(
		node: TreeNode<T> | null,
		insertNode: TreeNode<T>,
		nodeNumber: number,
	): TreeNode<T> {
		if (node === null) {
			this._nodesCount += 1;
			return insertNode;
		}

		if (nodeNumber <= node.leftSubTreeSize) {
			node.left = this._insertNode(node.left, insertNode, nodeNumber);
			node.left.parent = node;
			node.leftSubTreeSize += 1;
		} else {
			node.right = this._insertNode(
				node.right,
				insertNode,
				nodeNumber - node.leftSubTreeSize - 1,
			);
			node.right.parent = node;
		}

		node.height = 1 + Math.max(nodeHeight(node.left), nodeHeight(node.right));

		const balance = this._getBalanceFactor(node);

		if (balance > 1 && nodeNumber < (node.left?.leftSubTreeSize ?? 0)) {
			return this._rotateRight(node);
		}

		if (
			balance < -1 &&
			nodeNumber - node.leftSubTreeSize - 1 > (node.right?.leftSubTreeSize ?? 0)
		) {
			return this._rotateLeft(node);
		}

		if (balance > 1 && node.left && nodeNumber > node.left.leftSubTreeSize) {
			node.left = this._rotateLeft(node.left);
			return this._rotateRight(node);
		}

		if (
			balance < -1 &&
			node.right &&
			nodeNumber - node.leftSubTreeSize - 1 < node.right.leftSubTreeSize
		) {
			node.right = this._rotateRight(node.right);
			return this._rotateLeft(node);
		}

		return node;
	}

	private _getBalanceFactor(node: TreeNode<T> | null): number {
		if (node === null) {
			return 0;
		}

		return nodeHeight(node.left) - nodeHeight(node.right);
	}

	private _rotateLeft(node: TreeNode<T>): TreeNode<T> {
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

	private _rotateRight(node: TreeNode<T>): TreeNode<T> {
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
