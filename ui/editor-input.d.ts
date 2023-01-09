import EdiotrView from './editor-view';
export default class EditorInput {
    private _domElement;
    private _view;
    private _isFocused;
    constructor(view: EdiotrView);
    get isFocused(): boolean;
    focus(): void;
    render(parent: HTMLElement): void;
    private _initEventListeners;
    private _onInput;
}
