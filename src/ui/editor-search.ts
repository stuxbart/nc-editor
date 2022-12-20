import { EventEmitter } from '../events';
import { createDiv, createElement } from './dom-utils';
import EdiotrView from './editor-view';
import { EvSearchUi, SearchUiEvents } from './events';
import { CSSClasses } from '../styles/css';
import EditSession from '../edit-session/edit-session';
import { EvSearch } from '../edit-session/events';
import { EvDocument } from '../document-session/events';

class EditorSearch extends EventEmitter<SearchUiEvents> {
	private _view: EdiotrView;
	private _mountPoint: HTMLElement | null = null;
	private _searchContainer: HTMLDivElement | null = null;
	private _closeButton: HTMLButtonElement | null = null;
	private _input: HTMLInputElement | null = null;
	private _resultsContainer: HTMLParagraphElement | null = null;
	private _isOpen: boolean = false;
	private _seatchMatchesCount: number = 0;
	private _searchPhrase: string = '';

	constructor(view: EdiotrView) {
		super();
		this._view = view;
		this._mountPoint = view.getDOMElement();
		this._createSearchContainer();
		this._initEventListeners();
	}
	private get _session(): EditSession {
		return this._view.session;
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
		this._view.on(EvSearchUi.Open, () => {
			this.show();
			this.update();
		});

		this._view.on(EvSearch.Finished, () => {
			this._seatchMatchesCount = this._session.getSearchMatchCount();
			this.update();
		});
		this._view.on(EvDocument.Set, () => {
			if (this._input && this._searchPhrase) {
				this._session.search(this._searchPhrase);
			}
		});

		if (this._closeButton) {
			this._closeButton.addEventListener('click', () => {
				this.emit(EvSearchUi.Close, undefined);
				this.hide();
			});
		}
		if (this._input) {
			this._input.addEventListener('input', () => {
				if (!this._input) {
					return;
				}
				this._searchPhrase = this._input.value;
				this._session.search(this._searchPhrase);
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
