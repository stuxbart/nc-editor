import DocumentSession from '../document-session/document-session';
import Document from '../document/document';
import EditSession from '../edit-session/edit-session';
import { Range } from '../selection';
import { getWordAfter, getWordBefore } from '../text-utils';

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

		for (const sel of selections) {
			if (sel.isCollapsed) {
				continue;
			}
			const removedText = document.remove(sel);
			const removedLines = removedText.split('\n');
			docSession.updateLinesTokens(sel.start.line);
			editSession.updateLinesSearchResults(sel.start.line);
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
			docSession.updateLinesTokens(line);
			editSession.updateLinesSearchResults(line);
			editSession.updateSelctions(line, offset, insertedLines[0], insertedLines[1]);
		}
		docSession.emitLinesCountChanged(1);
		docSession.emitEditEvent();
	}

	public remove(type: number = 0): string {
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const selections = editSession.selections.getSelections();

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
			const removedLines = removedText.split('\n');
			docSession.updateLinesTokens(sel.start.line);
			editSession.updateLinesSearchResults(sel.start.line);
			docSession.emitLinesCountChanged(sel.end.line - sel.start.line);
			editSession.updateSelctions(
				sel.start.line,
				sel.start.offset,
				-removedLines.length + 1,
				-(sel.end.offset - sel.start.offset),
			);
			text += removedText;
		}
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
			const line = document.getLine(sel.start.line);
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
			const line = document.getLine(sel.start.line);
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
			line++;
		}

		docSession.updateLinesTokens(sel.start.line - 1);
		sel.start.line -= 1;
		sel.end.line -= 1;
		editSession.emitSelectionChangedEvent();
		docSession.emitEditEvent();
	}

	public swapLinesDown(): void {
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const selections = editSession.selections.getSelections();
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
			line--;
		}

		docSession.updateLinesTokens(sel.start.line);
		sel.start.line += 1;
		sel.end.line += 1;
		editSession.emitSelectionChangedEvent();
		docSession.emitEditEvent();
	}

	public indentSelectedLines(indentString: string = '\t'): void {
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const selectedLines = editSession.getActiveLinesNumbers();
		if (selectedLines.size < 2) {
			return;
		}
		for (const lineNumber of selectedLines) {
			document.insert(indentString, lineNumber, 0);
			docSession.updateLinesTokens(lineNumber);
			editSession.updateSelctions(lineNumber, 0, 0, 1);
		}

		docSession.emitEditEvent();
	}

	public removeIndentFromSelectedLines(indentString: string = '\t'): void {
		const document = this._document;
		const editSession = this._editSession;
		const docSession = this._documentSession;
		const selectedLines = editSession.getActiveLinesNumbers();

		for (const lineNumber of selectedLines) {
			const line = document.getLine(lineNumber);
			if (!line.startsWith(indentString)) {
				continue;
			}
			document.remove(new Range(lineNumber, 0, lineNumber, indentString.length));
			docSession.updateLinesTokens(lineNumber);
			editSession.updateSelctions(lineNumber, 0, 0, 1);
		}

		docSession.emitEditEvent();
	}
}
