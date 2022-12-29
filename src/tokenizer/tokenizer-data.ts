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

	public getLineData(lineNumber: number): TokenizerLineData {
		const lineData = this._tree.getData(lineNumber);
		if (lineData !== null) {
			return lineData;
		}
		return { tokens: [], state: { scope: '' }, length: 0 };
	}

	public getLinesData(firstLine: number, linesCount: number): TokenizerLineData[] {
		return this._tree.getNodesData(firstLine, linesCount);
	}

	public setLineData(lineNumber: number, data: TokenizerLineData): void {
		const ndoe = this._tree.getNode(lineNumber);
		if (ndoe === null) {
			return;
		}
		ndoe.data = data;
	}

	public getLineTokens(lineNumber: number): Token[] {
		const lineData = this._tree.getData(lineNumber);
		if (lineData !== null) {
			return lineData.tokens;
		}
		return [];
	}

	public clear(): void {
		this._tree.clear();
	}

	public insertLine(data: TokenizerLineData, lineNumber: number): void {
		this._tree.insert(data, lineNumber);
	}
}
