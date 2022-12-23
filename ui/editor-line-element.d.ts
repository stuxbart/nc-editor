import { Row } from '../document/line';
import { HighlighterSchema } from '../highlighter';
export default class EditorLineElement {
    private _line;
    private _text;
    private _isActive;
    private _isHovered;
    private _domElement;
    private _tokens;
    private _highlighterSchema;
    constructor(line: Row, active?: boolean, highlighterSchema?: HighlighterSchema);
    get line(): number;
    getNode(): ChildNode | null;
    setData(line: Row): void;
    render(): void;
    setSchema(highlighterSchema: HighlighterSchema): void;
    private _renderTokens;
    setText(text: string): void;
    setActive(active: boolean): void;
    setHover(hovered: boolean): void;
}
