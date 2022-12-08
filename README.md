# NC editor
NC Editor is a code editor written in TypeScript. The editor was created with intention to perform basic file operations pretty fast even in large files.
You can check editor demo at https://stuxbart.github.io/nc-editor/.

## Project stage
The editor is in early development stage so there might be some bugs. Also a lot of features isn't implemented yet. 
Already implemented features you can find in Features section.

## Features
+ Editing large size files, a file containing 10,000,000 lines (~50 characters per line) takes about 1GB of memory (with disabled tokenization).
+ Basic file operations as insert, delete, copy, paste, cut.
+ Simple tokenization and syntax highlighting (right now only JavaScript code, also not fully implemented).
+ Multi selections and hotkeys related to them.

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

Taking into account that project is still in development stage there is no specified place where you can get the latest `nc-editor.js` file. 
The easiest way to get this file is to go to 'gh-pages' branch an get already built file, this file should be up to date but some latest changes may not be applied yet.
If you want the latest version you should colne the repository and build it as described in 'Development environment' section.

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

