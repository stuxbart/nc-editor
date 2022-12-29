class TreeNode<T> implements TreeNode<T> {
	public left: TreeNode<T> | null = null;
	public right: TreeNode<T> | null = null;
	public parent: TreeNode<T> | null = null;
	public data: T;
	public leftSubTreeSize: number = 0;
	public height: number = 1;

	constructor(data: T) {
		this.data = data;
	}
}

export default TreeNode;
