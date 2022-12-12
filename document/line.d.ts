import { Token } from '../tokenizer';
export default class Line {
    rawText: string;
    tokens: Token[];
    lineBreaks: number[];
    constructor(rawText: string, tokens: Token[], lineBreaks: number[]);
}
