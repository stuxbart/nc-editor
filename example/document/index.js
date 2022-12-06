const doc = new nc.Document('line1\nline2\nline3');
console.log(doc.text, '\nLines: ', doc.linesCount);
// line1
// line2
// line3
// Lines:  3
doc.insert('line0\n', 0, 0);
console.log(doc.text, doc.linesCount);
// line0
// line1
// line2
// line3
// Lines:  4
doc.removeLine(3);
console.log(doc.text, doc.linesCount);
// line0
// line1
// line2
// Lines:  3
doc.removeLine(0);
console.log(doc.text, doc.linesCount);
// line1
// line2
// Lines:  2
doc.insertLineAfter('line5', 1);
console.log(doc.text, doc.linesCount);
// line1
// line2
// line5
// Lines:  3
doc.insertLineBefore('line00', 0);
console.log(doc.text, doc.linesCount);
// line00
// line1
// line2
// line5
// Lines:  4
doc.insertLineBefore('line01', 1);
console.log(doc.text, doc.linesCount);
// line00
// line01
// line1
// line2
// line5
// Lines:  5
doc.remove(new nc.Range(2, 0, 2, 5));
console.log(doc.text, doc.linesCount);
// line00
// line01
//
// line2
// line5
// Lines:  5
doc.insert('new line 1', 2, 0);
console.log(doc.text, doc.linesCount);
// line00
// line01
// new line 1
// line2
// line5
// Lines:  5
doc.remove(new nc.Range(3, 0, 4, 0));
console.log(doc.text, doc.linesCount);
// line00
// line01
// new line 1
// line5
// Lines:  4
doc.removeLine(0);
console.log(doc.text, doc.linesCount);
// line01
// new line 1
// line5
// Lines:  3
doc.remove(new nc.Range(0, 0, 5, 0));
console.log(doc.text, doc.linesCount);
//
// Lines:  1
doc.insert('Empty file', 0, 0);
console.log(doc.text, doc.linesCount);
// Empty file
// Lines:  1
doc.insert('\nline 1\nline 2\nline 3\nline 4', 0, 10);
console.log(doc.text, '\nLines: ', doc.linesCount);
// Empty file
// line 1
// line 2
// line 3
// line 4
// Lines:  5
console.log(doc.getText()); // same as doc.text
// Empty file
// line 1
// line 2
// line 3
// line 4
console.log(doc.getLine(1));
// line 1
console.log(doc.getLines(1, 3));
// ['line 1', 'line 2', 'line 3']
console.log(doc.getLines(1, 30));
// ['line 1', 'line 2', 'line 3', 'line 4'] // return only existing lines
console.log(doc.getFirstLine());
// Empty file
console.log(doc.getLastLine());
// line 4
