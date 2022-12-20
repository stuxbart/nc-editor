import Mode from '../mode/mode';
import { JSMode } from './JavaScript';
import { LaTeXMode } from './LaTeX';
import { TextMode } from './Text';

type IModes = Record<string, Mode>;

export const MODES: IModes = {
	JavaScript: JSMode,
	Text: TextMode,
	LaTeX: LaTeXMode,
	default: TextMode,
};
