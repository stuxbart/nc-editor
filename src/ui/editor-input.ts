import { Editor } from '../editor';
import { EDITOR_INPUT_CLASS, EDITOR_INPUT_ID } from './config';
import { createTextArea } from './dom-utils';
import EdiotrView from './editor-view';
import { EvFocus, EvKey } from './events';

export default class EditorInput {
	private _domElement: HTMLTextAreaElement | null = null;
	private _editor: Editor | null = null;
	private _view: EdiotrView | null = null;

	private _isCtrlHold: boolean = false;

	constructor(editor: Editor, view: EdiotrView) {
		this._editor = editor;
		this._view = view;

		this._domElement = createTextArea(EDITOR_INPUT_CLASS);
		this._domElement.id = EDITOR_INPUT_ID;
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
			this._domElement.addEventListener('keydown', (e) => this._onKeyDown(e));
		}
		if (this._view) {
			this._view.on(EvFocus.Changed, (e) => {
				if (e.focused) {
					this.focus();
				}
			});
			this._view.on(EvKey.CtrlDown, () => {
				this._isCtrlHold = true;
			});
			this._view.on(EvKey.CtrlUp, () => {
				this._isCtrlHold = false;
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

	private _onKeyDown(e: KeyboardEvent): void {
		if (this._editor === null) {
			return;
		}
		switch (e.key) {
			case 'Backspace': {
				if (!this._isCtrlHold) {
					this._editor.remove();
				}
				break;
			}
			case 'Delete': {
				if (!this._isCtrlHold) {
					this._editor.remove(1);
				}
				break;
			}
			case 'Tab':
				this._editor.insert('\t');
				e.preventDefault();
				e.stopPropagation();
				break;

			default:
				break;
		}
	}
}
