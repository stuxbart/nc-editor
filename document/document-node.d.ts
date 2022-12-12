/**
 * Base element used to build Document tree structure.
 * One Node represent one line of text in document.
 */
export default class DocumentNode {
    left: DocumentNode | null;
    right: DocumentNode | null;
    parent: DocumentNode | null;
    text: string;
    leftSubTreeSize: number;
    height: number;
    constructor(text?: string);
}
