import Line from '../document/line';
import { HighlighterSchema } from '../highlighter';
export default class EditorLineElement {
    private _text;
    private _isActive;
    private _isHovered;
    private _domElement;
    private _tokens;
    private _highlighterSchema;
    constructor(line: Line, active?: boolean, highlighterSchema?: HighlighterSchema);
    getNode(): ChildNode | null;
    setData(line: Line): void;
    render(): void;
    setSchema(highlighterSchema: HighlighterSchema): void;
    private _renderTokens;
    setText(text: string): void;
    setActive(active: boolean): void;
    setHover(hovered: boolean): void;
}
