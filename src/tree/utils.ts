import TreeNode from './tree-node';

export const nodeHeight = (node: TreeNode<any> | null): number => (node === null ? 0 : node.height);
