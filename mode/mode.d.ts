import { HighlighterSchema } from '../highlighter';
import { Tokenizer } from '../tokenizer/tokenizer';
export default class Mode {
    private _tokenizer;
    private _highlighterSchema;
    private _name;
    constructor(tokenizer: Tokenizer, highlighterSchema: HighlighterSchema, name: string);
    get schema(): HighlighterSchema;
    get tokenizer(): Tokenizer;
    get name(): string;
}
