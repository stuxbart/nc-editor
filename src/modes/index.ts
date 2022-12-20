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

export function getMode(name: string): Mode {
	name = name.toLowerCase();
	switch (name) {
		case 'javascript':
			return MODES.JavaScript;
		case 'text':
			return MODES.Text;
		case 'latex':
			return MODES.LaTeX;
		default:
			return MODES.default;
	}
}
