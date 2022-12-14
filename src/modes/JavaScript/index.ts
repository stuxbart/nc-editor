import Mode from '../../mode/mode';
import JSTokenizer from './tokenizer';
import { JSHighlighterSchema } from './tokens';

const JSMode = new Mode(new JSTokenizer(), JSHighlighterSchema, 'javascript');

export { JSTokenizer, JSMode };
