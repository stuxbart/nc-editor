import { Editor } from '../editor';
import EdiotrView from './editor-view';
export default class EditorInput {
    private _domElement;
    private _editor;
    private _view;
    constructor(editor: Editor, view: EdiotrView);
    focus(): void;
    render(parent: HTMLElement): void;
    private _initEventListeners;
    private _onInput;
}
