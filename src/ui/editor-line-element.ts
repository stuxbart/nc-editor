import Line from '../document/line';
import { Token } from '../tokenizer';
import { CSSClasses } from './config';
import { createElement, createNodeFromTemplate } from './dom-utils';

export default class EditorLineElement {
	private _text: string = '';
	private _isActive: boolean = false;
	private _isHovered: boolean = false;
	private _domElement: ChildNode | null = null;
	private _tokens: Token[] = [];

	constructor(line: Line, active: boolean = false) {
		this._text = line.rawText;
		this._tokens = line.tokens;
		this._domElement = createNodeFromTemplate(
			`<div class="${CSSClasses.MULTI_LINE}">
			<div class="${CSSClasses.MULTI_LINE_CONTENT}">
			  ${this._text || '<br />'}
			</div>
		</div>`,
		);
		const el = this._domElement as HTMLElement;
		el.style.height = '20px';
		this.setActive(active);
		this._renderTokens();
	}

	public getNode(): ChildNode | null {
		return this._domElement;
	}

	public setData(line: Line): void {
		if (line.rawText === this._text && this._tokens.length > 0) {
			return;
		}
		this._text = line.rawText;
		this._tokens = line.tokens;
		this._renderTokens();
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

		const t = [];
		for (let i = 0; i < this._tokens.length; i++) {
			const token = this._tokens[i];
			const el = createElement('span');
			el.className = token.type.toString();
			const startIndex = token.startIndex;
			const endIndex =
				i + 1 < this._tokens.length ? this._tokens[i + 1].startIndex : this._text.length;
			el.textContent = this._text.substring(startIndex, endIndex);
			t.push(el);
		}
		el.firstElementChild.replaceChildren(...t);
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
