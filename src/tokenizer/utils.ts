import { TokenizerLineData } from './tokenizer-data';

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
