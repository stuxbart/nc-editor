import Mode from '../mode/mode';
import { JSMode } from './JavaScript';
import { TextMode } from './Text';

type IModes = Record<string, Mode>;

export const MODES: IModes = {
	JavaScript: JSMode,
	default: TextMode,
};
