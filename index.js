const text = `Shortcuts:
multiple cursors \t\t\t Ctrl + Click
multiple selections \t\t\t Ctrl + Drag
swap lines \t\t\t\t Alt + ArrowUp / ArrowDown
indent \t\t\t\t\t select text + Tab
outdent \t\t\t\t select text + Shift + Tab
rectangle seelction \t\t\t click + Shift + Alt + click & drag
select word \t\t\t\t double click

jump to previous word \t\t\t Ctrl + ArrowLeft
jump to next word \t\t\t Ctrl + ArrowRight

select word before \t\t\t Ctrl + Shift + ArrowLeft
select word after \t\t\t Ctrl + Shift + ArrowRight

delete word before \t\t\t Ctrl + Backspace
delete word after \t\t\t Ctrl + Delete

select all \t\t\t\t Ctrl + A
cut \t\t\t\t\t Ctrl + X
paste \t\t\t\t\t Ctrl + V
copy \t\t\t\t\t Ctrl + C
find \t\t\t\t\t Ctrl + F
undo \t\t\t\t\t Ctrl + Z
redo \t\t\t\t\t Ctrl + Y

`;

const textCode = `const header = document.getElementsByClassName('editor-header')[0];

const setActive = (activeElementNumber) => {
	for (const child of header.children) {
		child.classList.remove('editor-header-button--active');
	}
	header.children[activeElementNumber].classList.add('editor-header-button--active');
};

const editor = new nc.Editor();
const editorView = new nc.EditorView(editor, 'editor');
const doc1 = new nc.Document(text);
const doc2 = new nc.Document(textCode);
const doc3 = new nc.Document('');
const documents = [
	{ doc: doc1, name: 'shortcuts.txt', mode: 'Text', id: '' },
	{ doc: doc2, name: 'index.js', mode: 'JavaScript', id: '' },
	{ doc: doc3, name: 'test.js', mode: 'JavaScript', id: '' },
];

for (let i = 0; i < documents.length; i++) {
	const doc = documents[i];
	doc.id = editor.addDocument(doc.doc, doc.name, doc.mode);
	const button = document.createElement('button');
	button.textContent = doc.name;
	button.className = 'editor-header-button';
	button.addEventListener('click', () => {
		editorView.setDocument(doc.id);
		setActive(i);
	});
	header.appendChild(button);
}

editorView.setDocument(documents[0].id);
setActive(0);

`;
const header = document.getElementsByClassName('editor-header')[0];

const setActive = (activeElementNumber) => {
	for (const child of header.children) {
		child.classList.remove('editor-header-button--active');
	}
	header.children[activeElementNumber].classList.add('editor-header-button--active');
};

const editor = new nc.Editor();
const editorView = new nc.EditorView(editor, 'editor');
const doc1 = new nc.Document(text);
const doc2 = new nc.Document(textCode);
const doc3 = new nc.Document('');
const documents = [
	{ doc: doc1, name: 'shortcuts.txt', mode: 'Text', id: '' },
	{ doc: doc2, name: 'index.js', mode: 'JavaScript', id: '' },
	{ doc: doc3, name: 'test.js', mode: 'JavaScript', id: '' },
];

for (let i = 0; i < documents.length; i++) {
	const doc = documents[i];
	doc.id = editor.addDocument(doc.doc, doc.name, doc.mode);
	const button = document.createElement('button');
	button.textContent = doc.name;
	button.className = 'editor-header-button';
	button.addEventListener('click', () => {
		editorView.setDocument(doc.id);
		setActive(i);
	});
	header.appendChild(button);
}

editorView.setDocument(documents[0].id);
setActive(0);
