import { Theme } from './themes';

/*
 * View events
 */
export enum EvView {
	Initialized = 'view.Initialized',
}
export interface IViewInitializedEvent {
	[EvView.Initialized]: () => void;
}
/*
 * Scroll events
 */
export enum EvScroll {
	Changed = 'scroll.Changed',
}
export interface IScrollEvent {
	[EvScroll.Changed]: ({
		firstVisibleLine,
		emitterName,
	}: {
		firstVisibleLine: number;
		emitterName: string;
	}) => void;
}
/*
 * Focus events
 */
export enum EvFocus {
	Changed = 'focus.Changed',
}
export interface IFocusEvent {
	[EvFocus.Changed]: ({ focused }: { focused: boolean }) => void;
}

/*
 * Theme events
 */
export enum EvTheme {
	Changed = 'theme.Changed',
}
export interface IThemeEvent {
	[EvTheme.Changed]: ({ theme }: { theme: Theme }) => void;
}
/*
 * Font events
 */
export enum EvFont {
	LetterWidth = 'font.LetterWidthChange',
}
export interface ILetterWidthEvent {
	[EvFont.LetterWidth]: ({ width }: { width: number }) => void;
}
/*
 * Gutter events
 */
export enum EvGutter {
	Width = 'gutter.WidthChanged',
}
export interface IGutterWidthEvent {
	[EvGutter.Width]: ({ width }: { width: number }) => void;
}
