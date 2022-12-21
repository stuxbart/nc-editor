import EdiotrView from './editor-view';
export default class EditorInput {
    private _domElement;
    private _view;
    constructor(view: EdiotrView);
    focus(): void;
    render(parent: HTMLElement): void;
    private _initEventListeners;
    private _onInput;
}
