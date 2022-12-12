const text20lines = `Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Phasellus posuere ligula at auctor varius.
Vestibulum dapibus neque vitae luctus egestas.
Cras sed nunc tincidunt, facilisis turpis et, vulputate nunc.
Cras placerat urna eget magna gravida vestibulum.
Integer porta neque sit amet sapien sodales lacinia.
Nam aliquet ligula nec pharetra imperdiet.
Curabitur lobortis leo non vulputate feugiat.
Fusce eget elit et massa consectetur ultricies vitae ac tellus.
Nunc volutpat turpis sit amet ullamcorper volutpat.
Praesent id lorem a enim luctus consequat.
Suspendisse nec ante eget urna pretium aliquam.
Curabitur vel arcu ut nibh pellentesque pharetra.
Mauris pulvinar ligula nec lectus vehicula congue.
Nam id nunc ullamcorper, vulputate erat non, auctor eros.
Cras volutpat nunc et urna bibendum dapibus.
Morbi lobortis est et eros vehicula, ac luctus dui consequat.
Donec bibendum libero ut lorem faucibus, at bibendum orci porta.
Lorem ipsum dolor sit amet, consectetur adipiscing elit.
Nam a quam vitae neque faucibus euismod.`;

const editor = new nc.Editor();
const editorView = new nc.EditorView(editor, 'root');
const doc = new nc.Document(text20lines);
editor.addDocument(doc);
