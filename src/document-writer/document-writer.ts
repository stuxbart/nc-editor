import { IndentType } from '../document-session';
import DocumentSession from '../document-session/document-session';
import Document from '../document/document';
import EditSession from '../edit-session/edit-session';
import { RegExpSearch, SerachResults } from '../search';
import { Point, Range, Selection } from '../selection';
import { getWordAfter, getWordBefore, removeAccents } from '../text-utils';

export default class DocumentWriter {
	private _documentSession: DocumentSession;
	private _editSession: EditSession;

	constructor(documentSesion: DocumentSession, editSession: EditSession) {
		this._documentSession = documentSesion;
		this._editSession = editSession;
	}

	private get _document(): Document {
		return this._documentSession.document;
	}

	public insert(str: string): void {
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const selections = editSession.selections.getSelections();
		docSession.history.startTransaction();
		editSession.history.createSnapshot();

		for (const sel of selections) {
			if (sel.isCollapsed) {
				continue;
			}
			const removedText = document.remove(sel);
			docSession.history.deleted(
				new Point(sel.start.line, sel.start.offset),
				new Point(sel.end.line, sel.end.offset),
				removedText,
			);
			const removedLines = removedText.split('\n');
			docSession.updateLinesTokens(sel.start.line);
			editSession.wrapper.removeLines(sel.start.line + 1, removedLines.length - 1);
			editSession.wrapper.updateLines(sel.start.line, removedLines.length + 1);
			if (removedLines.length > 0) {
				editSession.updateRemovedLinesSearchResults(
					sel.start.line + 1,
					removedLines.length - 1,
				);
			}
			// editSession.updateLineSearchResults(sel.start.line);
			docSession.emitLinesCountChanged(sel.end.line - sel.start.line);
			editSession.updateSelctions(
				sel.start.line,
				sel.start.offset,
				-removedLines.length + 1,
				-(sel.end.offset - sel.start.offset),
			);
		}

		for (const sel of selections) {
			const line = sel.start.line;
			const offset = sel.start.offset;
			const insertedLines = document.insert(str, line, offset);
			docSession.history.inserted(new Point(sel.start.line, sel.start.offset), str);
			editSession.wrapper.insertNewLines(sel.start.line + 1, insertedLines[0]);
			editSession.wrapper.updateLines(sel.start.line, insertedLines[0] + 1);
			docSession.updateLinesTokens(line);
			if (insertedLines[0] > 0) {
				editSession.updateNewLinesSearchResults(line + 1, insertedLines[0]);
			}
			editSession.updateLineSearchResults(line);
			editSession.updateSelctions(line, offset, insertedLines[0], insertedLines[1]);
		}
		docSession.history.closeTransaction();
		docSession.emitLinesCountChanged(1);
		docSession.emitEditEvent();
	}

	public remove(type: number = 0): string {
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const selections = editSession.selections.getSelections();
		docSession.history.startTransaction();
		editSession.history.createSnapshot();

		let text: string = '';
		for (const sel of selections) {
			if (sel.isCollapsed) {
				if (sel.start.offset === 0 && type === 0) {
					if (sel.start.line !== 0) {
						sel.start.line -= 1;
						const line = document.getLine(sel.start.line);
						sel.start.offset = line.length + 1;
					} else {
						continue;
					}
				}
				if (type === 1) {
					const line = document.getLine(sel.start.line);
					if (
						sel.end.offset === line.length &&
						sel.end.line + 1 !== document.linesCount
					) {
						sel.end.offset = 0;
						sel.end.line += 1;
					} else {
						sel.end.offset = sel.end.offset + 1;
					}
				} else {
					sel.start.offset = sel.start.offset - 1;
				}
			}
			const removedText = document.remove(sel);
			docSession.history.deleted(
				new Point(sel.start.line, sel.start.offset),
				new Point(sel.end.line, sel.end.offset),
				removedText,
			);
			const removedLines = removedText.split('\n');
			docSession.updateLinesTokens(sel.start.line);
			editSession.wrapper.removeLines(sel.start.line + 1, removedLines.length - 1);
			editSession.wrapper.updateLines(sel.start.line, removedLines.length + 1);
			if (removedLines.length > 0) {
				editSession.updateRemovedLinesSearchResults(
					sel.start.line + 1,
					removedLines.length - 1,
				);
			}
			editSession.updateLineSearchResults(sel.start.line);
			docSession.emitLinesCountChanged(sel.end.line - sel.start.line);
			editSession.updateSelctions(
				sel.start.line,
				sel.start.offset,
				-removedLines.length + 1,
				-(sel.end.offset - sel.start.offset),
			);
			text += removedText;
		}
		docSession.history.closeTransaction();
		docSession.emitEditEvent();
		return text;
	}

	public removeWordBefore(): string {
		const document = this._document;
		const editSession = this._editSession;
		const selections = editSession.selections.getSelections();
		for (const sel of selections) {
			if (!sel.isCollapsed) {
				continue;
			}
			const line = removeAccents(document.getLine(sel.start.line));
			const word = getWordBefore(line, sel.start.offset);
			sel.start.offset -= word.length;
		}
		return this.remove();
	}

	public removeWordAfter(): string {
		const document = this._document;
		const editSession = this._editSession;
		const selections = editSession.selections.getSelections();
		for (const sel of selections) {
			if (!sel.isCollapsed) {
				continue;
			}
			const line = removeAccents(document.getLine(sel.start.line));
			const word = getWordAfter(line, sel.start.offset);
			sel.end.offset += word.length;
		}
		return this.remove(1);
	}

	public cut(): void {
		const removedText = this.remove();
		void navigator.clipboard.writeText(removedText);
	}

	public copy(): void {
		const document = this._document;
		const editSession = this._editSession;
		const selections = editSession.selections.getSelections();

		let copiedText: string = '';
		for (const sel of selections) {
			if (sel.isCollapsed) {
				continue;
			}
			copiedText += document.getText(sel);
		}
		void navigator.clipboard.writeText(copiedText);
	}

	public swapLinesUp(): void {
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const selections = editSession.selections.getSelections();
		docSession.history.startTransaction();
		editSession.history.createSnapshot();

		if (selections.length !== 1) {
			return;
		}
		const sel = selections[0];
		if (sel.start.line === 0) {
			return;
		}
		let line = sel.start.line;
		while (line < sel.end.line + 1) {
			document.swapLineWithPrevious(line);
			docSession.history.swappedLinesUp(line);
			line++;
		}
		editSession.wrapper.updateLines(sel.start.line - 1, 2);
		docSession.updateLinesTokens(sel.start.line - 1);
		sel.start.line -= 1;
		sel.end.line -= 1;
		docSession.history.closeTransaction();
		editSession.emitSelectionChangedEvent();
		docSession.emitEditEvent();
	}

	public swapLinesDown(): void {
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const selections = editSession.selections.getSelections();
		docSession.history.startTransaction();
		editSession.history.createSnapshot();

		if (selections.length !== 1) {
			return;
		}
		const sel = selections[0];
		if (sel.end.line === document.linesCount - 1) {
			return;
		}

		let line = sel.end.line;
		while (line > sel.start.line - 1) {
			document.swapLineWithNext(line);
			docSession.history.swappedLinesDown(line);
			line--;
		}
		editSession.wrapper.updateLines(sel.start.line, 2);
		docSession.updateLinesTokens(sel.start.line);
		sel.start.line += 1;
		sel.end.line += 1;
		docSession.history.closeTransaction();
		editSession.emitSelectionChangedEvent();
		docSession.emitEditEvent();
	}

	public indentSelectedLines(indentString: string = '\t'): void {
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const selectedLines = editSession.getActiveLinesNumbers();
		docSession.history.startTransaction();
		editSession.history.createSnapshot();

		if (selectedLines.size < 2) {
			return;
		}
		for (const lineNumber of selectedLines) {
			document.insert(indentString, lineNumber, 0);
			docSession.history.inserted(new Point(lineNumber, 0), indentString);
			docSession.updateLinesTokens(lineNumber);
			editSession.wrapper.updateLines(lineNumber, 1);
			editSession.updateSelctions(lineNumber, 0, 0, 1);
		}
		docSession.history.closeTransaction();
		docSession.emitEditEvent();
	}

	public removeIndentFromSelectedLines(indentString: string = '\t'): void {
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const selectedLines = editSession.getActiveLinesNumbers();
		docSession.history.startTransaction();
		editSession.history.createSnapshot();

		for (const lineNumber of selectedLines) {
			const line = document.getLine(lineNumber);
			if (!line.startsWith(indentString)) {
				continue;
			}
			document.remove(new Range(lineNumber, 0, lineNumber, indentString.length));
			docSession.history.deleted(
				new Point(lineNumber, 0),
				new Point(lineNumber, indentString.length),
				indentString,
			);
			docSession.updateLinesTokens(lineNumber);
			editSession.wrapper.updateLines(lineNumber, 1);
			editSession.updateSelctions(lineNumber, 0, 0, 1);
		}
		docSession.history.closeTransaction();
		docSession.emitEditEvent();
	}

	public replaceSearchResult(text: string): void {
		const search = this._editSession.searchResults;
		if (search.matchCount === 0) {
			return;
		}
		const searchRes = search.getActiveSearchResPosition();

		const selection = new Selection(
			searchRes.start.line,
			searchRes.start.offset,
			searchRes.end.line,
			searchRes.end.offset,
		);
		this._editSession.setSelection(selection);
		this.insert(text);
	}

	public replaceAllSearchResult(str: string): void {
		this._editSession.selections.clear();
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const search = this._editSession.searchResults;
		docSession.history.startTransaction();
		editSession.history.createSnapshot();

		let nextResult;
		const position = new Point(0, 0);
		while (
			(nextResult = this._editSession.findNextOccurnece(position.line, position.offset)) !==
			null
		) {
			const sel = new Selection(
				nextResult.start.line,
				nextResult.start.offset,
				nextResult.end.line,
				nextResult.end.offset,
			);
			const removedText = document.remove(sel);
			docSession.history.deleted(
				new Point(sel.start.line, sel.start.offset),
				new Point(sel.end.line, sel.end.offset),
				removedText,
			);
			const insertedLines = document.insert(str, sel.start.line, sel.start.offset);
			docSession.history.inserted(new Point(sel.start.line, sel.start.offset), str);
			docSession.updateLinesTokens(sel.start.line);
			position.line = sel.start.line + insertedLines[0];
			if (insertedLines[0] > 0) {
				position.offset = insertedLines[1];
			} else {
				position.offset = sel.start.offset + insertedLines[1];
			}
		}
		editSession.wrapper.wrap();
		editSession.search(search.phrase);
		docSession.emitLinesCountChanged(1);
		docSession.history.closeTransaction();
		docSession.emitEditEvent();

		this._editSession.onlyLastSelection();
	}

	public changeIndentToTabs(): void {
		const docSession = this._documentSession;
		if (docSession.indentType === IndentType.TABS) {
			return;
		}
		const editSession = this._editSession;
		const search = new RegExpSearch();
		const document = this._document;
		const results = new SerachResults();
		const regex = '^  *';
		search.search(regex, document, results);
		docSession.history.startTransaction();
		editSession.history.createSnapshot();
		docSession.setIndentType(IndentType.TABS);

		for (let i = 0; i < document.linesCount; i++) {
			const res = results.getLineResutls(i);
			if (res.length < 1) {
				continue;
			}
			const sel = res[0];
			const count = res[0].end.offset;
			const tabs = Math.round(count / docSession.indentSize);

			const removedText = document.remove(sel);
			docSession.history.deleted(
				new Point(sel.start.line, sel.start.offset),
				new Point(sel.end.line, sel.end.offset),
				removedText,
			);
			const indent = '\t'.repeat(tabs);
			document.insert(indent, sel.start.line, sel.start.offset);
			docSession.history.inserted(new Point(sel.start.line, sel.start.offset), indent);
			docSession.updateLinesTokens(sel.start.line);
		}

		editSession.wrapper.wrap();
		editSession.search(editSession.searchResults.phrase);
		docSession.history.closeTransaction();
		docSession.emitEditEvent();

		this._editSession.onlyLastSelection();
	}

	public changeIndentToSpaces(): void {
		const docSession = this._documentSession;
		if (docSession.indentType === IndentType.SPACES) {
			return;
		}
		const editSession = this._editSession;
		const search = new RegExpSearch();
		const document = this._document;
		const results = new SerachResults();
		const regex = '^\t\t*';
		search.search(regex, document, results);
		docSession.history.startTransaction();
		editSession.history.createSnapshot();
		docSession.setIndentType(IndentType.SPACES);

		for (let i = 0; i < document.linesCount; i++) {
			const res = results.getLineResutls(i);
			if (res.length < 1) {
				continue;
			}
			const sel = res[0];
			const count = res[0].end.offset;
			const spaces = Math.round(count) * docSession.indentSize;

			const removedText = document.remove(sel);
			docSession.history.deleted(
				new Point(sel.start.line, sel.start.offset),
				new Point(sel.end.line, sel.end.offset),
				removedText,
			);
			const indent = ' '.repeat(spaces);
			document.insert(indent, sel.start.line, sel.start.offset);
			docSession.history.inserted(new Point(sel.start.line, sel.start.offset), indent);
			docSession.updateLinesTokens(sel.start.line);
		}

		editSession.wrapper.wrap();
		editSession.search(editSession.searchResults.phrase);
		docSession.history.closeTransaction();
		docSession.emitEditEvent();

		this._editSession.onlyLastSelection();
	}
}
