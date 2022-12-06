import { Editor } from '../editor';
import { EDITOR_INPUT_CLASS, EDITOR_INPUT_ID } from './config';
import { createTextArea } from './dom-utils';
import EdiotrView from './editor-view';
import { EvFocus } from './events';

export default class EditorInput {
	private _domElement: HTMLTextAreaElement | null = null;
	private _editor: Editor | null = null;
	private _view: EdiotrView | null = null;

	private _insertLine: number = 0;
	private _insertOffset: number = 0;

	constructor(editor: Editor, view: EdiotrView) {
		this._editor = editor;
		this._view = view;

		this._domElement = createTextArea(EDITOR_INPUT_CLASS);
		this._domElement.id = EDITOR_INPUT_ID;
		this._initEventListeners();
	}

	public setInsertPos(line: number, offset: number): void {
		this._insertLine = line;
		this._insertOffset = offset;
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
		this._editor.insert(this._domElement.value, this._insertLine, this._insertOffset);
		this._domElement.value = '';
	}

	private _onKeyDown(e: KeyboardEvent): void {
		if (this._editor === null) {
			return;
		}
		switch (e.key) {
			case 'Backspace':
				this._editor.remove();
				e.preventDefault();
				e.stopPropagation();
				break;
			case 'Delete':
				this._editor.remove(1);
				e.preventDefault();
				e.stopPropagation();
				break;
			case 'Tab':
				this._editor.insert('\t', this._insertLine, this._insertOffset);
				e.preventDefault();
				e.stopPropagation();
				break;

			default:
				break;
		}
	}
}