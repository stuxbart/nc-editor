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

export function compareLineData(line1: TokenizerLineData, line2: TokenizerLineData): boolean {
	if (line1.state.scope !== line2.state.scope) {
		return false;
	}
	if (line1.tokens.length !== line2.tokens.length) {
		return false;
	}
	if (line1.length !== line2.length) {
		return false;
	}
	for (let i = 0; i < line1.tokens.length; i++) {
		const tok1 = line1.tokens[i];
		const tok2 = line2.tokens[i];
		if (tok1.startIndex !== tok2.startIndex) {
			return false;
		}
		if (tok1.type !== tok2.type) {
			return false;
		}
	}
	return true;
}
