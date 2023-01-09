declare class TreeNode<T> implements TreeNode<T> {
    left: TreeNode<T> | null;
    right: TreeNode<T> | null;
    parent: TreeNode<T> | null;
    data: T;
    leftSubTreeSize: number;
    height: number;
    constructor(data: T);
}
export default TreeNode;
