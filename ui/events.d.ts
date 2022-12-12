import { Theme } from './themes';
export declare enum EvView {
    Initialized = "view.Initialized"
}
export interface IViewInitializedEvent {
    [EvView.Initialized]: undefined;
}
export declare enum EvScroll {
    Changed = "scroll.Changed"
}
export interface IScrollEvent {
    [EvScroll.Changed]: {
        firstVisibleLine: number;
        emitterName: string;
    };
}
export declare enum EvFocus {
    Changed = "focus.Changed"
}
export interface IFocusEvent {
    [EvFocus.Changed]: {
        focused: boolean;
    };
}
export declare enum EvTheme {
    Changed = "theme.Changed"
}
export interface IThemeEvent {
    [EvTheme.Changed]: {
        theme: Theme;
    };
}
export declare enum EvFont {
    LetterWidth = "font.LetterWidthChange"
}
export interface ILetterWidthEvent {
    [EvFont.LetterWidth]: {
        width: number;
    };
}
export declare enum EvGutter {
    Width = "gutter.WidthChanged"
}
export interface IGutterWidthEvent {
    [EvGutter.Width]: {
        width: number;
    };
}
export declare enum EvKey {
    CtrlDown = "key.Ctrl.down",
    CtrlUp = "key.Ctrl.up",
    ShiftDown = "key.Shift.down",
    ShiftUp = "key.Shift.up",
    AltDown = "key.Alt.down",
    AltUp = "key.Alt.up"
}
export interface IKeyEvnets {
    [EvKey.CtrlDown]: undefined;
    [EvKey.CtrlUp]: undefined;
    [EvKey.ShiftDown]: undefined;
    [EvKey.ShiftUp]: undefined;
    [EvKey.AltDown]: undefined;
    [EvKey.AltUp]: undefined;
}
export interface EditorGutterEvents extends IGutterWidthEvent {
}
export interface ScrollBarEvents extends IScrollEvent {
}
export interface TextLayerEvents extends ILetterWidthEvent {
}
export interface EditorViewEvents extends IScrollEvent, IFocusEvent, IThemeEvent, ILetterWidthEvent, IViewInitializedEvent, IKeyEvnets {
}
