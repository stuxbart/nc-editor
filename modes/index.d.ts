import Mode from '../mode/mode';
type IModes = Record<string, Mode>;
export declare const MODES: IModes;
export declare function getMode(name: string): Mode;
export {};
