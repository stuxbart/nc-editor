export default class AVLTreeNode<T> {
    left: AVLTreeNode<T> | null;
    right: AVLTreeNode<T> | null;
    parent: AVLTreeNode<T> | null;
    data: T;
    leftSubTreeSize: number;
    height: number;
    constructor(data: T);
}
