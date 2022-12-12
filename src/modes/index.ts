import Mode from '../mode/mode';
import { JSMode } from './JavaScript';

type IModes = Record<string, Mode>;

export const MODES: IModes = {
	JavaScript: JSMode,
	default: JSMode,
};
