# NC editor
NC Editor is a code editor written in TypeScript. The editor was created with intention to perform basic file operations pretty fast even in large files.
You can check editor demo at https://stuxbart.github.io/nc-editor/.

## Project stage
The editor is in early development stage so there might be some bugs. Also some features are not implemented yet. 
Already implemented features you can find in Features section.

## Features
+ Editing large size files
+ Basic file operations as insert, delete, copy, paste, cut.
+ Simple tokenization and syntax highlighting (right now only JavaScript code, ).
+ Multi selections and hotkeys related to them.
+ Line wrapping
+ Search and replace
+ Edit history (undo / redo)
+ Theming
+ Indent type change (spaces / tabs)

## ToDo
+ use arrows to change cursor position (works without wrapping)
+ improve performance of undo / redo operations
+ generic tokenizer
+ replace in selected area
+ multiline search
+ text markers
+ horizontal scroll
+ autocomplete
+ highlight matching brackets
+ auto indent

## Known bugs
+ selecting text in some lines when line wrapping is enabled
+ tokenization of inserted text stop after empty line
+ vertical scroll bar is not working properly for larger files

## Development environment
You should be able to clone this repository with:
```
git clone https://github.com/stuxbart/nc-editor.git
```
and install all necessary packages with:
```
npm install
```
Project doesn't use any external libraries besides develoment tools so it shouldn't take too long.
After installation you can build project by running:
```
npm run build
```
You can also run Webpack development server with:
```
npm run serve
```

## Embedding
In order to add editor into your project add following to body of your HTLM template:
``` HTML
<div id="root" style="height: 500px; width: 500px"></div>
<script src="nc-editor.js"></script>
<script>
    var editor = new nc.Editor();
    var editorView = new nc.EditorView(editor, 'root');
</script>
```
Editor and EditorView are standalone components so you need to create them separatelly. 

If you want you can create two separate views:
```HTML
<div id="root1" style="height: 500px; width: 500px"></div>
<div id="root2" style="height: 500px; width: 500px"></div>
<script src="nc-editor.js"></script>
<script>
    var editor = new nc.Editor();
    var editorView = new nc.EditorView(editor, 'root1');
    var editorView = new nc.EditorView(editor, 'root2');
</script>
```
Since both views are connected with the same Editor instance changes done in one view gonna be visible in both of them.

## Usage
### Creating document
The Document class is used to store text data. First instance of editor view create one instance of document by default but you can also create it like so:
```Javascript
const doc = new nc.Document("My\ntext");
```

### Creating editor
The Editor class manages all document and edit sessions. To create it call:
```Javascript
const editor = new nc.Editor();
```

### Creating editor view
The EditorView class is responsible for rendering entire editor structure. This class need an Editor instance to get access to documents and both document and edit sessions. To create an isntance you need also specify mount point:
```JavaScript
const editorView = new nc.EditorView(
    editor,                             // Editor instance
    document.getElementById("editor")   // mount point
);
```

### Attatch document to editor
The document class stores only text data that means we don't have access to edit history, tokens and other text descriptors like indent type. 
These informations are stored in the DocumentSession class. This class is created by edytor when you call `addDocument` method like so:
```JavaScript
const doc = new nc.Document("My\ntext");
const docSessionId = editor.addDocument(
    doc,        // document
    "file.txt", // file name
    "text"      // mode (used for tokenization and highlighting)
);
```
The `addDocument` method returns ID of newly created session, later you can use this ID to change visible document in EditorView.

### Display document
To view the file you need to call:
```JavaScript
editorView.setDocument(
    docSessionId    // document session id returned by editor.addDocument()
);
```
When `setDocument` is called editor view ask editor for EditSession for given document, if session for this document don't exist yet it will create new one. Otherwise EditorView will use already existing session.
The EditSession holds reference to DocumentSession along with:
+ wrapper data
+ text selections
+ search results
+ editor width
+ document writer (set of functions used to edit a file)
+ document reader (set of functions used to read from a file)
The EditorViews that share the same EditSession will display same selections and text wrap will be correct only for one of them (unless they have the same width). In most cases this is not desired behavior so you can set second parameter of `setDocument` method to `true`: 
```JavaScript
editorView.setDocument(
    docSessionId,
    true
);
```
By doing so there will be created new EditSession even if there is existing one. Thanks to that two different EditViews can work separately on the same text document.
In another approach to that you can also create EditSession manually like so:
```JavaScript
const editSessionId = editor.createSession(docSessionId);
```
Then you can reffer to this session by id, e.g:
```JavaScript
const editSession = editor.getEditSessionForDocument(editSessionId);
```
Or use this session in your view:
```JavaScript
editorView.setSession(editSessionId);
```

### Common operations
The EditorView, EditSession and DocumentSession classes share set of methods that enables you to work with editor.
+ Get current editor view session:
```JavaScript
editorView.session
```
+ Get displayed document session:
```JavaScript
editorView.session.documentSession
```
+ Get document:
```JavaScript
documentSession.document;
```
+ Set theme:
```JavaScript
editorView.setTheme("light");
```
+ Scroll to line:
```JavaScript
editorView.scrollToLine(3);
```
+ Scroll to last selection:
```JavaScript
editorView.scrollTolastSelection();
```
+ Change document mode:
```JavaScript
documentSession.setMode("mode");
```
+ Enable tokenization:
```JavaScript
documentSession.enableTokenization();
```
+ Disable tokenization:
```JavaScript
documentSession.disableTokenization();
```
+ Tokenize document:
```JavaScript
documentSession.tokenize();
```
+ Enable line wrap:
```JavaScript
editSession.enableWrap();
```
+ Disable line wrap:
```JavaScript
editSession.disableWrap();
```

### History manager
+ Undo:
```JavaScript
documentSession.undo();
// or
editSession.undo();  // will update wrap and selections positions
```
+ Redo:
```JavaScript
documentSession.redo();
// or
editSession.redo(); // will update wrap and selections positions
```

### Search
+ Search in document:
```JavaScript
editSession.search("phrase or regex");
```
+ Get search results:
```JavaScript
editSession.searchResults.results;
```
+ Get search phrase:
```JavaScript
editSession.getSearchPhrase();
```
+ Get search results count:
```JavaScript
editSession.getSearchMatchCount();
```
+ Enable regex search:
```JavaScript
editSession.enableRegExpSearch();
```
+ Disable regex search:
```JavaScript
editSession.enableRegExpSearch();
```
+ Enable case sensitive search:
```JavaScript
editSession.enableCaseSensitiveSearch();
```
+ Disable case sensitive search:
```JavaScript
editSession.disableCaseSensitiveSearch();
```

### Selections
+ Get selections:
```JavaScript
editSession.getSelctions();
```
+ Add selection:
```JavaScript
const selection = new nc.Selection(0,0,1,0);
editSession.addSelection(selection);
```
+ Set selection:
```JavaScript
const selection = new nc.Selection(0,0,1,0);
editSession.setSelection(selection);
```
+ Select all:
```JavaScript
editSession.selectAll();
```
+ Select word at position:
```JavaScript
editSession.selectWordAt(
    { line: 0, offset: 1 }, // position in text
    false                   // keep already existing selections
);
```
+ Select line:
```JavaScript
editSession.selectLine(0);
```
+ Get selected lines numbers:
```JavaScript
editSession.getActiveLinesNumbers();
```
+ Get selected rows numbers:
```JavaScript
editSession.getActiveRowsNumbers();
```

### Edit file
To edit file you can use the DocumentWriter class. You can get it from view or edit session:
```JavaScript
editorView.writer
// or
editSession.writer
```
The difference beetwen using DocumentWriter and Document api functions is that it also updates edit history, selection positions, wrap data, tokenizer data, search results and emit edit events so editor view can update visible text. This class use selections stored in edit session to perform many operations, e.g if there is many cursors in text then writer's `insert` method will winsert text in many places at once.

The DocumentWriter class enables you to:
+ insert text in selected area:
```JavaScript
writer.insert("inserted text");
```
+ remove text in selected area:
```JavaScript
const removedText = writer.remove();
```
+ cut text in selected area:
```JavaScript
writer.cut(); // add text to clipboard
```
+ copy text in selected area:
```JavaScript
writer.copy(); // add text to clipboard
```
+ swap lines (works only when there is one selection):
```JavaScript
writer.swapLinesUp();
writer.swapLinesDown();
```
+ indent / outdent selected lines
```JavaScript
const indentString = "\t";
writer.indentSelectedLines(indentString);
writer.removeIndentFromSelectedLines(indentString);
```
+ replace selected search result:
```JavaScript
writer.replaceSearchResult("new text");
```
+ replace all search result:
```JavaScript
writer.replaceAllSearchResult("new text");
```
+ change indent type:
```JavaScript
writer.changeIndentToTabs();
const indentSize = 4;
writer.changeIndentToSpaces(indentSize);
```

### Read from file
To read data from the file combined with tokenizer data, wrap data and search results you can use the Reader class. You can get it from view or edit session:
```JavaScript
editorView.reader
// or
editSession.reader
```
Reader returned by these properties will be instance of DocumentReader or WrapReader class. The type of returned reader depends on enabled text wrapping.
Both readers share common api that allow you to:
+ get lines data:
```JavaScript
const firsLineNumber = 0;
const linesCount = 4;
const lines = reader.getLines(firsLineNumber, linesCount);
```
The `getLines` function will return list of objects of the Line type: 
```TypeScript
class Line {
	public rawText: string;
	public tokens: Token[];
	public lineBreaks: number[];
	public searchResults: SearchResult[];
}
```
+ get rows data:
```JavaScript
const firstRowNumber = 0;
const rowsCount = 4;
const lines = reader.getRows(firstRowNumber, rowsCount);
```
The `rowsCount` function will return list of objects of the Row type: 
```TypeScript
class Row {
    public number: number;
    public line: number;
    public ord: number;
    public offset: number;
    public text: string;
    public tokens: Token[];
    public searchResults: SearchResult[];
}
```
+ get total lines count
```JavaScript
reader.getTotalLinesCount();
```
+ get total rows count
```JavaScript
reader.getTotalRowsCount();
```
+ get selected text:
```JavaScript
reader.getSelectedText();
```
