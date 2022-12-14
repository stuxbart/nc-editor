import { EventEmitter } from '../events';
import { createDiv } from './dom-utils';
import EdiotrView from './editor-view';
import { EvSearchUi, SearchUiEvents } from './events';
import { CSSClasses } from '../styles/css';
import EditSession from '../edit-session/edit-session';
import { EvSearch } from '../edit-session/events';
import { EvDocument } from '../document-session/events';
import { debounce } from '../utils';

class EditorSearch extends EventEmitter<SearchUiEvents> {
	private _view: EdiotrView;
	private _mountPoint: HTMLElement | null = null;
	private _searchContainer: HTMLDivElement | null = null;
	private _closeButton: HTMLButtonElement | null = null;
	private _nextResultButton: HTMLButtonElement | null = null;
	private _prevResultButton: HTMLButtonElement | null = null;
	private _caseSensitiveToggleButton: HTMLButtonElement | null = null;
	private _regexToggleButton: HTMLButtonElement | null = null;
	private _selectionSearchToggleButton: HTMLButtonElement | null = null;
	private _replaceButton: HTMLButtonElement | null = null;
	private _replaceAllButton: HTMLButtonElement | null = null;
	private _input: HTMLTextAreaElement | null = null;
	private _replaceInput: HTMLTextAreaElement | null = null;
	private _resultsContainer: HTMLParagraphElement | null = null;
	private _isOpen: boolean = false;
	private _seatchMatchesCount: number = 0;
	private _searchPhrase: string = '';

	private _regexpSearch: boolean = false;
	private _caseSensitiveSearch: boolean = false;
	private _selectionSearch: boolean = false;

	constructor(view: EdiotrView) {
		super();
		this._view = view;
		this._mountPoint = view.getDOMElement();
		this._createSearchContainer();
		this._initEventListeners();

		this._search = debounce(this._search.bind(this), 300);
	}
	private get _session(): EditSession {
		return this._view.session;
	}

	public update(): void {
		if (this._resultsContainer) {
			const activeNumber = this._session.searchResults.activeSearchResultNumber;
			if (activeNumber > -1 && this._seatchMatchesCount > 0) {
				this._resultsContainer.textContent = `${activeNumber + 1} of ${
					this._seatchMatchesCount
				}`;
			} else {
				this._resultsContainer.textContent = 'No results';
			}
		}
		if (this._input) {
			if (this._input.value !== this._searchPhrase) {
				this._input.value = this._searchPhrase;
			}
		}
	}

	public show(): void {
		this._isOpen = true;
		if (this._searchContainer) {
			this._searchContainer.style.display = 'flex';
		}
		this._input?.focus();
		this._input?.select();
		this._session.enableSearchAfterEdit();
	}

	public hide(): void {
		this._isOpen = false;
		if (this._searchContainer) {
			this._searchContainer.style.display = 'none';
		}
		this._session.disableSearchAfterEdit();
	}

	public getDOMElement(): HTMLDivElement | null {
		return this._searchContainer;
	}

	private _search(): void {
		this._session.search(this._searchPhrase);
	}

	private _initEventListeners(): void {
		this._view.on(EvSearchUi.Open, ({ phrase }) => {
			if (phrase !== null) {
				if (!this._input) {
					return;
				}
				this._searchPhrase = phrase;
				this._session.search(this._searchPhrase);
			}
			this.show();
			this.update();
		});

		this._view.on(EvSearch.Finished, () => {
			this._seatchMatchesCount = this._session.getSearchMatchCount();
			this.update();
		});
		this._view.on(EvDocument.Set, () => {
			if (this._isOpen) {
				this._session.enableSearchAfterEdit();
				this._session.setCaseSensitiveSearch(this._caseSensitiveSearch);
				this._session.setSelectionSearch(this._selectionSearch);
				this._session.setRegExpSearch(this._regexpSearch);
			} else {
				this._session.disableSearchAfterEdit();
				this._setCaseSensitiveSearch(this._session.caseSensitiveSearch);
				this._setSelectionSearch(this._session.selectionSearch);
				this._setRegExpSearch(this._session.regexpSearch);
			}
			if (this._input && this._searchPhrase && this._isOpen) {
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
				this._search();
			});
		}

		if (this._nextResultButton) {
			this._nextResultButton.addEventListener('click', () => {
				this._session.nextSearchResult();
			});
		}

		if (this._prevResultButton) {
			this._prevResultButton.addEventListener('click', () => {
				this._session.prevSearchResult();
			});
		}

		if (this._caseSensitiveToggleButton) {
			this._caseSensitiveToggleButton.addEventListener('click', () => {
				const isCaseSensitiveSearchEnabled = this._session.toggleCaseSensitiveSearch();
				this._setCaseSensitiveSearch(isCaseSensitiveSearchEnabled);
			});
		}

		if (this._selectionSearchToggleButton) {
			this._selectionSearchToggleButton.addEventListener('click', () => {
				const isSelectionSearchEnabled = this._session.toggleSelectionSearch();
				this._setSelectionSearch(isSelectionSearchEnabled);
			});
		}

		if (this._regexToggleButton) {
			this._regexToggleButton.addEventListener('click', () => {
				const isRegExpSearchEnabled = this._session.toggleRegExpSearch();
				this._setRegExpSearch(isRegExpSearchEnabled);
			});
		}

		if (this._replaceButton) {
			this._replaceButton.addEventListener('click', () => {
				if (this._replaceInput) {
					this._session.writer.replaceSearchResult(this._replaceInput.value);
				}
			});
		}

		if (this._replaceAllButton) {
			this._replaceAllButton.addEventListener('click', () => {
				if (this._replaceInput) {
					this._session.writer.replaceAllSearchResult(this._replaceInput.value);
				}
			});
		}
	}

	private _setCaseSensitiveSearch(enabled: boolean): void {
		if (enabled) {
			this._caseSensitiveToggleButton?.classList.add('nc-search__button--active');
		} else {
			this._caseSensitiveToggleButton?.classList.remove('nc-search__button--active');
		}
		this._caseSensitiveSearch = enabled;
	}

	private _setSelectionSearch(enabled: boolean): void {
		if (enabled) {
			this._selectionSearchToggleButton?.classList.add('nc-search__button--active');
		} else {
			this._selectionSearchToggleButton?.classList.remove('nc-search__button--active');
		}
		this._selectionSearch = enabled;
	}

	private _setRegExpSearch(enabled: boolean): void {
		if (enabled) {
			this._regexToggleButton?.classList.add('nc-search__button--active');
		} else {
			this._regexToggleButton?.classList.remove('nc-search__button--active');
		}
		this._regexpSearch = enabled;
	}

	private _createSearchContainer(): void {
		if (this._mountPoint === null) {
			return;
		}
		const container = createDiv(CSSClasses.SEARCH);
		this._searchContainer = container;
		const html = `
		<div class="nc-search__main">
			<div class="nc-search__inputs">
				<textarea class="nc-search__input" autofocus="" placeholder="Search..."></textarea>
				<textarea class="nc-search__input" placeholder="Repalce..."></textarea>
			</div>
			<div class="nc-search__controls">
				<div class="nc-search__controls-container">
					<button class="nc-search__button">Aa</button>
					<button class="nc-search__button">.*</button>
					<button class="nc-search__button">S</button>
				</div>
				<div class="nc-search__controls-container">
					<button class="nc-search__button">Replace</button>
				</div>
				<div class="nc-search__controls-container">
					<button class="nc-search__button">Replace All</button>
				</div>
			</div>
			<div class="nc-search__close">
				<button class="nc-search__button">X</button>
			</div>
		</div>
		<div class="nc-search__nav">
			<div class="nc-search__result">
				0 of 0
			</div>
			<div class="nc-search__controls">
				<div class="nc-search__controls-container">
					<button class="nc-search__button">???</button>
					<button class="nc-search__button">???</button>
				</div>
			</div>
		</div>`;
		this._searchContainer.innerHTML = html;
		this._mountPoint.appendChild(this._searchContainer);

		this._input = container.querySelectorAll('textarea')[0];
		this._replaceInput = container.querySelectorAll('textarea')[1];
		this._closeButton = container.querySelector('.nc-search__close > .nc-search__button');
		this._resultsContainer = container.querySelector('.nc-search__result');
		this._prevResultButton = container.querySelectorAll(
			'.nc-search__nav button',
		)[0] as HTMLButtonElement;
		this._nextResultButton = container.querySelectorAll(
			'.nc-search__nav button',
		)[1] as HTMLButtonElement;

		this._caseSensitiveToggleButton = container.querySelectorAll(
			'.nc-search__main button',
		)[0] as HTMLButtonElement;

		this._regexToggleButton = container.querySelectorAll(
			'.nc-search__main button',
		)[1] as HTMLButtonElement;

		this._selectionSearchToggleButton = container.querySelectorAll(
			'.nc-search__main button',
		)[2] as HTMLButtonElement;

		this._replaceButton = container.querySelectorAll(
			'.nc-search__main button',
		)[3] as HTMLButtonElement;

		this._replaceAllButton = container.querySelectorAll(
			'.nc-search__main button',
		)[4] as HTMLButtonElement;

		this.hide();
	}
}

export default EditorSearch;
