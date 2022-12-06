import DocumentNode from './document-node';

export const nodeHeight = (node: DocumentNode | null): number => (node === null ? 0 : node.height);
