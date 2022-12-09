import { Editor } from '../editor';
import { CSSClasses, EDITOR_INPUT_ID } from './config';
import { createTextArea } from './dom-utils';
import EdiotrView from './editor-view';
import { EvFocus } from './events';

export default class EditorInput {
	private _domElement: HTMLTextAreaElement | null = null;
	private _editor: Editor | null = null;
	private _view: EdiotrView | null = null;

	constructor(editor: Editor, view: EdiotrView) {
		this._editor = editor;
		this._view = view;

		this._domElement = createTextArea(CSSClasses.MAIN_INPUT);
		this._domElement.id = EDITOR_INPUT_ID;
		this._domElement.autofocus = true;
		this._initEventListeners();
	}

	public focus(): void {
		this._domElement?.focus();
	}

	public render(parent: HTMLElement): void {
		if (this._domElement) {
			parent.appendChild(this._domElement);
		}
	}

	private _initEventListeners(): void {
		if (this._domElement) {
			this._domElement.addEventListener('input', () => this._onInput());
		}
		if (this._view) {
			this._view.on(EvFocus.Changed, (e) => {
				if (e.focused) {
					this.focus();
				}
			});
		}
	}

	private _onInput(): void {
		if (
			this._editor === null ||
			this._domElement === null ||
			this._domElement.value.length === 0
		) {
			return;
		}
		this._editor.insert(this._domElement.value);
		this._domElement.value = '';
	}
}
