import { HighlighterSchema } from '../highlighter';
import { Tokenizer } from '../tokenizer/tokenizer';
export default class Mode {
    private _tokenizer;
    private _highlighterSchema;
    constructor(tokenizer: Tokenizer, highlighterSchema: HighlighterSchema);
    get schema(): HighlighterSchema;
    get tokenizer(): Tokenizer;
}
