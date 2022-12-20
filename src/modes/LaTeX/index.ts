import Mode from '../../mode/mode';
import LaTeXTokenizer from './tokenizer';
import { LaTeXHighlighterSchema } from './tokens';

const LaTeXMode = new Mode(new LaTeXTokenizer(), LaTeXHighlighterSchema, 'latex');

export { LaTeXTokenizer, LaTeXMode };
