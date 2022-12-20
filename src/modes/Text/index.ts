import Mode from '../../mode/mode';
import TextTokenizer from './tokenizer';
import { TextHighlighterSchema } from './tokens';

const TextMode = new Mode(new TextTokenizer(), TextHighlighterSchema, 'text');

export { TextTokenizer, TextMode };
