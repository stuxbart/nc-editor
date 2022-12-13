import { Editor } from '../editor';
import { EventEmitter } from '../events';
import { EvDocument, EvSearch } from '../editor/events';
import { createDiv, createElement } from './dom-utils';
import EdiotrView from './editor-view';
import { EvSearchUi, SearchUiEvents } from './events';
import { CSSClasses } from '../styles/css';

class EditorSearch extends EventEmitter<SearchUiEvents> {
	private _editor: Editor | null = null;
	private _view: EdiotrView | null = null;
	private _mountPoint: HTMLElement | null = null;
	private _searchContainer: HTMLDivElement | null = null;
	private _closeButton: HTMLButtonElement | null = null;
	private _input: HTMLInputElement | null = null;
	private _resultsContainer: HTMLParagraphElement | null = null;
	private _isOpen: boolean = false;
	private _seatchMatchesCount: number = 0;
	private _searchPhrase: string = '';

	constructor(editor: Editor, view: EdiotrView) {
		super();
		this._editor = editor;
		this._view = view;
		this._mountPoint = view.getDOMElement();
		this._createSearchContainer();
		this._initEventListeners();
	}

	public update(): void {
		if (this._resultsContainer) {
			this._resultsContainer.textContent = `Results: ${this._seatchMatchesCount}`;
		}
	}

	public show(): void {
		this._isOpen = true;
		if (this._searchContainer) {
			this._searchContainer.style.display = 'flex';
		}
		this._input?.focus();
	}

	public hide(): void {
		this._isOpen = false;
		if (this._searchContainer) {
			this._searchContainer.style.display = 'none';
		}
	}

	public getDOMElement(): HTMLDivElement | null {
		return this._searchContainer;
	}

	private _initEventListeners(): void {
		if (this._view) {
			this._view.on(EvSearchUi.Open, () => {
				this.show();
				this.update();
			});
		}

		if (this._editor) {
			this._editor.on(EvSearch.Finished, () => {
				if (this._editor) {
					this._seatchMatchesCount = this._editor.getSearchMatchCount();
					this.update();
				}
			});
			this._editor.on(EvDocument.Set, () => {
				if (this._editor) {
					this._seatchMatchesCount = this._editor.getSearchMatchCount();
					this._searchPhrase = this._editor.getSearchPhrase();
					if (this._input) {
						this._input.value = this._searchPhrase;
					}
					this.update();
				}
			});
		}
		if (this._closeButton) {
			this._closeButton.addEventListener('click', () => {
				this.emit(EvSearchUi.Close, undefined);
				this.hide();
			});
		}
		if (this._input) {
			this._input.addEventListener('input', () => {
				if (!this._input || !this._editor) {
					return;
				}
				this._searchPhrase = this._input.value;
				this._editor.search(this._searchPhrase);
			});
		}
	}

	private _createSearchContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		this._searchContainer = createDiv(CSSClasses.SEARCH);
		this._mountPoint.appendChild(this._searchContainer);

		this._closeButton = createElement('button') as HTMLButtonElement;
		this._closeButton.className = CSSClasses.CLOSE_SEARCH;
		this._closeButton.textContent = 'X';
		this._searchContainer.appendChild(this._closeButton);

		this._input = createElement('input') as HTMLInputElement;
		this._input.className = CSSClasses.SEARCH_INPUT;
		this._input.autofocus = true;
		this._searchContainer.appendChild(this._input);

		this._resultsContainer = createElement('p') as HTMLParagraphElement;
		this._resultsContainer.className = CSSClasses.SEARCH_RESULT;
		this._searchContainer.appendChild(this._resultsContainer);

		this.hide();
	}
}

export default EditorSearch;
