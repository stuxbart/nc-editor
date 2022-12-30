import Tree from '../tree/tree';
import { Token } from './token';

export interface TokenizerLineState {
	scope: string;
}

export interface TokenizerLineData {
	tokens: Token[];
	state: TokenizerLineState;
	length: number;
}

export default class TokenizerData {
	private _tree: Tree<TokenizerLineData>;

	constructor() {
		this._tree = new Tree<TokenizerLineData>();
	}

	public get linesCount(): number {
		return this._tree.nodesCount;
	}

	public getLineData(lineNumber: number): TokenizerLineData {
		try {
			const lineData = this._tree.getData(lineNumber);
			return lineData;
		} catch (err: any) {
			return { tokens: [], state: { scope: '' }, length: 0 };
		}
	}

	public getLinesData(firstLine: number, linesCount: number): TokenizerLineData[] {
		let linesData: TokenizerLineData[] = [];
		try {
			linesData = this._tree.getNodesData(firstLine, linesCount);
		} catch (err: any) {
			linesData = [];
		} finally {
			const missingLines = linesCount - linesData.length;
			for (let i = 0; i < missingLines; i++) {
				linesData.push({ tokens: [], state: { scope: '' }, length: 0 });
			}
		}

		return linesData;
	}

	public setLineData(lineNumber: number, data: TokenizerLineData): void {
		const ndoe = this._tree.getNode(lineNumber);
		if (ndoe === null) {
			return;
		}
		ndoe.data = data;
	}

	public getLineTokens(lineNumber: number): Token[] {
		try {
			const lineData = this._tree.getData(lineNumber);
			return lineData.tokens;
		} catch (err: any) {
			return [];
		}
	}

	public getLinesTokens(firstLine: number, linesCount: number): Token[][] {
		const linesData = this.getLinesData(firstLine, linesCount);
		return linesData.map((data) => data.tokens);
	}

	public clear(): void {
		this._tree.clear();
	}

	public insertLine(data: TokenizerLineData, lineNumber: number): void {
		this._tree.insert(data, lineNumber);
	}
}
