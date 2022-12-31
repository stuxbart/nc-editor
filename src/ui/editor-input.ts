import { EDITOR_INPUT_ID } from './config';
import { CSSClasses } from '../styles/css';
import { createTextArea } from './dom-utils';
import EdiotrView from './editor-view';
import { EvFocus } from './events';
import { EvDocument } from '../document-session/events';

export default class EditorInput {
	private _domElement: HTMLTextAreaElement | null = null;
	private _view: EdiotrView;
	private _isFocused: boolean = false;

	constructor(view: EdiotrView) {
		this._view = view;

		this._domElement = createTextArea(CSSClasses.MAIN_INPUT);
		this._domElement.id = EDITOR_INPUT_ID;
		this._domElement.autofocus = true;
		this._domElement.autocapitalize = 'off';
		this._initEventListeners();
	}

	public get isFocused(): boolean {
		return this._isFocused;
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
			this._domElement.addEventListener('focus', () => (this._isFocused = true));
			this._domElement.addEventListener('blur', () => (this._isFocused = false));
		}

		this._view.on(EvFocus.Changed, (e) => {
			if (e.focused) {
				this.focus();
			}
		});
		this._view.on(EvDocument.Set, () => {
			this.focus();
		});
	}

	private _onInput(): void {
		if (this._domElement === null || this._domElement.value.length === 0) {
			return;
		}
		this._view.writer.insert(this._domElement.value);
		this._domElement.value = '';
	}
}
