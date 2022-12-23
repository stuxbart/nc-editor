import { EventEmitter } from '../events';
import EdiotrView from './editor-view';
import { EditorGutterEvents } from './events';
declare class EditorGutter extends EventEmitter<EditorGutterEvents> {
    private _view;
    private _mountPoint;
    private _gutterContainer;
    private _firstVisibleRow;
    private _visibleRowsCount;
    private _totalRowsCount;
    private _gutterWidth;
    constructor(view: EdiotrView);
    private get _session();
    update(): void;
    setWidth(width: number): void;
    setWidthForRowsCount(rowsCount: number): number;
    setFirstVisibleRow(firstRow: number): void;
    setVisibleRowsCount(rowsCount: number): void;
    setTotalRowsCount(rowsCount: number): void;
    private _initEventListeners;
    private _createGutterContainer;
    private _renderLinesNumbers;
}
export default EditorGutter;
