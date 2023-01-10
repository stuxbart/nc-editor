import { Row } from '../document/line';
import { Token } from '../tokenizer';
import { CSSClasses } from '../styles/css';
import { createDiv, createElement, px } from './dom-utils';
import { HighlighterSchema } from '../highlighter';

export default class EditorLineElement {
	private _line: number = 0;
	private _text: string = '';
	private _isActive: boolean = false;
	private _isHovered: boolean = false;
	private _domElement: ChildNode | null = null;
	private _tokens: Token[] = [];
	private _highlighterSchema: HighlighterSchema;

	constructor(line: Row, active: boolean = false, highlighterSchema: HighlighterSchema = {}) {
		this._line = line.line;
		this._text = line.text;
		this._tokens = line.tokens;
		this._highlighterSchema = highlighterSchema;
		this._domElement = createDiv(CSSClasses.MULTI_LINE);
		this._domElement.appendChild(createDiv(CSSClasses.MULTI_LINE_CONTENT));
		const el = this._domElement as HTMLElement;
		el.style.height = px(20);
		this.setActive(active);
		this._renderTokens();
	}

	public get line(): number {
		return this._line;
	}

	public getNode(): ChildNode | null {
		return this._domElement;
	}

	public setData(line: Row): void {
		if (line.text === this._text && this._tokens.length > 0) {
			return;
		}
		this._text = line.text;
		this._tokens = line.tokens;
	}

	public render(): void {
		this._renderTokens();
	}

	public unmount(): void {
		if (this._domElement) {
			this.clear();
			this._domElement.remove();
			if (this._domElement.firstChild) {
				this._domElement.removeChild(this._domElement.firstChild);
			}
			this._domElement = null;
		}
	}

	public clear(): void {
		const el = this._domElement as HTMLDivElement;
		if (el.firstElementChild === null) {
			return;
		}

		while (el.firstElementChild.lastChild) {
			const last = el.firstElementChild.lastChild;
			if (last.firstChild) {
				last.removeChild(last.firstChild);
			}
			el.firstElementChild.removeChild(last);
		}
	}

	public setSchema(highlighterSchema: HighlighterSchema): void {
		this._highlighterSchema = highlighterSchema;
	}

	private _renderTokens(): void {
		const el = this._domElement as HTMLDivElement;
		if (el.firstElementChild === null) {
			return;
		}

		if (this._tokens.length === 0) {
			el.firstElementChild.textContent = this._text;
			return;
		}
		this.clear();
		const t = [];
		for (let i = 0; i < this._tokens.length; i++) {
			const token = this._tokens[i];
			const el = createElement('span');
			el.className = this._highlighterSchema[token.type];
			const startIndex = token.startIndex;
			const endIndex =
				i + 1 < this._tokens.length ? this._tokens[i + 1].startIndex : this._text.length;
			el.textContent = this._text.substring(startIndex, endIndex);
			t.push(el);
		}
		el.firstElementChild.append(...t);
	}

	public setText(text: string): void {
		if (text === this._text) {
			return;
		}
		this._text = text;
		const el = this._domElement as HTMLDivElement;
		if (el.firstElementChild === null) {
			return;
		}
		el.firstElementChild.textContent = text;
	}

	public setActive(active: boolean): void {
		if (active === this._isActive) {
			return;
		}
		this._isActive = active;
		const el = this._domElement as HTMLElement;
		if (active) {
			el.classList.add(CSSClasses.MULTI_LINE_ACTIVE);
		} else {
			el.classList.remove(CSSClasses.MULTI_LINE_ACTIVE);
		}
	}

	public setHover(hovered: boolean): void {
		if (hovered === this._isHovered) {
			return;
		}
		this._isHovered = hovered;
		const el = this._domElement as HTMLElement;
		if (hovered) {
			el.classList.add(CSSClasses.MULTI_LINE_HOVERED);
		} else {
			el.classList.remove(CSSClasses.MULTI_LINE_HOVERED);
		}
	}
}
