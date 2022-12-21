import { EventEmitter } from '../events';
import EdiotrView from './editor-view';
import { EditorGutterEvents } from './events';
declare class EditorGutter extends EventEmitter<EditorGutterEvents> {
    private _view;
    private _mountPoint;
    private _gutterContainer;
    private _firstVisibleLine;
    private _visibleLinesCount;
    private _totalLinesCount;
    private _gutterWidth;
    constructor(view: EdiotrView);
    private get _session();
    update(): void;
    setWidth(width: number): void;
    setWidthForLinesCount(linesCount: number): number;
    setFirstVisibleLine(firstLine: number): void;
    setVisibleLinesCount(linesCount: number): void;
    setTotalLinesCount(linesCount: number): void;
    private _initEventListeners;
    private _createGutterContainer;
    private _renderLinesNumbers;
}
export default EditorGutter;
