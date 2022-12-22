export default class WrapNode {
	public left: WrapNode | null = null;
	public right: WrapNode | null = null;
	public parent: WrapNode | null = null;
	public data: LineWrapData;
	public leftSubTreeSize: number = 0; // lines before given node
	public leftSubTreeRows: number = 0; // rows before given node
	public height: number = 1;

	constructor(data: LineWrapData) {
		this.data = data;
	}
}

export class LineWrapData {
	public data: number[] = [];
}

export class RowWrapData {
	constructor(public line: number, public ord: number, public offset: number) {}
}
