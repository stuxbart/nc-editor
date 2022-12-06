import { Theme } from './themes';

/*
 * View events
 */
export enum EvView {
	Initialized = 'view.Initialized',
}
export interface IViewInitializedEvent {
	[EvView.Initialized]: undefined;
}
/*
 * Scroll events
 */
export enum EvScroll {
	Changed = 'scroll.Changed',
}
export interface IScrollEvent {
	[EvScroll.Changed]: {
		firstVisibleLine: number;
		emitterName: string;
	};
}
/*
 * Focus events
 */
export enum EvFocus {
	Changed = 'focus.Changed',
}
export interface IFocusEvent {
	[EvFocus.Changed]: { focused: boolean };
}

/*
 * Theme events
 */
export enum EvTheme {
	Changed = 'theme.Changed',
}
export interface IThemeEvent {
	[EvTheme.Changed]: { theme: Theme };
}
/*
 * Font events
 */
export enum EvFont {
	LetterWidth = 'font.LetterWidthChange',
}
export interface ILetterWidthEvent {
	[EvFont.LetterWidth]: { width: number };
}
/*
 * Gutter events
 */
export enum EvGutter {
	Width = 'gutter.WidthChanged',
}
export interface IGutterWidthEvent {
	[EvGutter.Width]: { width: number };
}
