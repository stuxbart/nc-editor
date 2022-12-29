import DocumentNode from '../document/document-node';
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
	private _data: WeakMap<DocumentNode, TokenizerLineData>;

	constructor() {
		this._data = new WeakMap<DocumentNode, TokenizerLineData>();
	}

	public get data(): WeakMap<DocumentNode, TokenizerLineData> {
		return this._data;
	}

	public getLineData(lineNode: DocumentNode): TokenizerLineData {
		const lineData = this._data.get(lineNode);
		if (lineData !== undefined) {
			return lineData;
		}
		return { tokens: [], state: { scope: '' }, length: 0 };
	}

	public getLineTokens(lineNode: DocumentNode): Token[] {
		const lineData = this._data.get(lineNode);
		if (lineData !== undefined) {
			return lineData.tokens;
		}
		return [];
	}
}
