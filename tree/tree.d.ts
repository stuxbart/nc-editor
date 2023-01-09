import TreeNode from './tree-node';
/**
 * Generic AVL tree.
 */
export default class Tree<T> {
    private _rootNode;
    private _nodesCount;
    get nodesCount(): number;
    get isEmpty(): boolean;
    clear(): void;
    getNodesData(firstNodeNumber: number, nodesCount: number): T[];
    getNodes(firstNodeNumber: number, nodesCount: number): TreeNode<T>[];
    getNode(nodeNumber: number): TreeNode<T> | null;
    getData(nodeNumber: number): T;
    getFirstNodeData(): T | null;
    getLastNodeData(): T | null;
    getFirstNode(): TreeNode<T> | null;
    getLastNode(): TreeNode<T> | null;
    removeNode(nodeNumber: number): void;
    insert(data: T, nodeNumber: number): TreeNode<T>;
    swapNodeWithNext(nodeNumber: number): void;
    swapNodeWithPrevious(nodeNumber: number): void;
    private _removeNode;
    private _getNodesData;
    private _getNextNode;
    private _getFirstNodeNumber;
    private _getLastNode;
    private _getNodeByNumber;
    private _insertNode;
    private _getBalanceFactor;
    private _rotateLeft;
    private _rotateRight;
}
