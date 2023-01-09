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

const longLines = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce porta iaculis augue, vitae elementum velit malesuada a. Donec vitae venenatis ex. Nam nec blandit ligula, eu feugiat nibh. Vestibulum ut lectus elit. Ut consequat elit eget erat aliquet, in lobortis orci volutpat. Suspendisse commodo magna quis turpis mattis, eu varius ex luctus. Pellentesque ac neque cursus, iaculis magna in, vestibulum sapien. Suspendisse sit amet mi justo. Fusce sagittis urna justo. Etiam sagittis ultrices urna et viverra. Sed auctor egestas consequat. Aenean id rhoncus mi. Fusce venenatis hendrerit risus, at blandit augue. Morbi venenatis bibendum lectus, ut dapibus ante mollis quis.
Pellentesque sodales hendrerit malesuada. Suspendisse non mauris in ligula posuere pharetra a molestie massa. Curabitur consequat fermentum laoreet. Mauris elementum odio tristique interdum porta. Suspendisse blandit neque at est egestas fermentum. Donec quam augue, congue ac sollicitudin ac, volutpat non ante. Donec ligula justo, tempus at pulvinar vitae, sodales ut leo. Ut posuere tincidunt purus, non posuere purus auctor in. Morbi sed dolor aliquam, feugiat urna ut, mattis nunc. Aliquam sed consequat metus, ac pulvinar tortor. Ut accumsan, ex ut tempor efficitur, orci lectus varius nunc, blandit vehicula augue dui id sem. Proin non odio ac enim mollis condimentum. Aliquam a tortor justo. Praesent vel enim ut purus sollicitudin viverra quis vitae leo. Aliquam erat volutpat.
Phasellus aliquam eget tortor vitae fringilla. In tincidunt bibendum dui, nec elementum lectus scelerisque ac. Nam euismod gravida suscipit. Mauris porttitor orci vel odio lobortis, ac consequat lectus tincidunt. Fusce nec metus tincidunt, vehicula risus at, cursus nisi. Vivamus sed felis enim. Sed laoreet mollis semper. Sed laoreet semper tellus in dictum. Vestibulum eget scelerisque felis. Nam lacinia efficitur nunc, in tincidunt dolor interdum mattis. Mauris venenatis eu nisi sed sollicitudin.
Pellentesque euismod nulla nunc, sit amet accumsan dui aliquet at. Aenean pharetra diam at nisl sagittis ullamcorper. Nunc fringilla, ex et congue sodales, orci arcu rutrum tortor, eu sagittis ligula nunc eget ipsum. Cras laoreet est non turpis interdum vestibulum. Vestibulum a eros et nisl mollis molestie a ac orci. Praesent elementum elit eget quam euismod accumsan. Mauris nec tempor nisi. Praesent venenatis blandit orci, malesuada pretium tortor. Suspendisse accumsan rhoncus quam ac mollis. Sed aliquam, dolor quis eleifend scelerisque, sapien augue varius nulla, a pharetra ipsum ipsum in tellus. Pellentesque cursus diam sed risus posuere efficitur. Curabitur ligula nunc, hendrerit nec ipsum sit amet, lacinia pellentesque felis. Suspendisse potenti. Ut tristique, ante in porta porttitor, magna turpis mattis neque, vel facilisis neque sem vel quam. Etiam sed leo dui.
Etiam accumsan ligula aliquet neque dapibus auctor ac ut risus. Sed sollicitudin nibh sed odio ornare dignissim. In magna ipsum, consequat eu libero in, dignissim varius diam. Sed condimentum mi porttitor ipsum vulputate, id suscipit nisl mattis. Cras non diam nisi. Donec mollis hendrerit dolor ac imperdiet. Aliquam eleifend massa tortor. Cras feugiat laoreet dui ut suscipit.
`;

const textCode = `const text = \`...\`;
const longLines = \`...\`;
const textCode = \`...\`;

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
const doc3 = new nc.Document(longLines);
const doc4 = new nc.Document('');
const documents = [
	{ doc: doc1, name: 'shortcuts.txt', mode: 'Text', id: '' },
	{ doc: doc2, name: 'index.js', mode: 'JavaScript', id: '' },
	{ doc: doc3, name: 'long_lines.txt', mode: 'Text', id: '' },
	{ doc: doc4, name: 'test.js', mode: 'JavaScript', id: '' },
];

for (let i = 0; i < documents.length; i++) {
	const doc = documents[i];
	doc.id = editor.addDocument(doc.doc, doc.name, doc.mode);
	const button = document.createElement('button');
	button.textContent = doc.name;
	button.className = 'editor-header-button';
	button.addEventListener('click', () => {
		editorView.setDocument(doc.id);
		editorView.session.enableWrap();
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
const doc3 = new nc.Document(longLines);
const doc4 = new nc.Document('');
const documents = [
	{ doc: doc1, name: 'shortcuts.txt', mode: 'Text', id: '' },
	{ doc: doc2, name: 'index.js', mode: 'JavaScript', id: '' },
	{ doc: doc3, name: 'long_lines.txt', mode: 'Text', id: '' },
	{ doc: doc4, name: 'test.js', mode: 'JavaScript', id: '' },
];

for (let i = 0; i < documents.length; i++) {
	const doc = documents[i];
	doc.id = editor.addDocument(doc.doc, doc.name, doc.mode);
	const button = document.createElement('button');
	button.textContent = doc.name;
	button.className = 'editor-header-button';
	button.addEventListener('click', () => {
		editorView.setDocument(doc.id);
		editorView.session.enableWrap();
		setActive(i);
	});
	header.appendChild(button);
}

editorView.setDocument(documents[0].id);
setActive(0);
