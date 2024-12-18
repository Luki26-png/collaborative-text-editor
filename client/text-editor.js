import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import * as Y from 'yjs'
import { QuillBinding } from 'y-quill'
import { WebsocketProvider } from 'y-websocket'


Quill.register('modules/cursors', QuillCursors);

const quill = new Quill(document.querySelector('#editor'), {
  modules: {
    cursors: true,
    toolbar: [
      // adding some Quill content features
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],
      ['link', 'image','formula'],
      [{ 'header': 1 }, { 'header': 2 }],   // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'script': 'sub'}, { 'script': 'super' }], // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],   // outdent/indent
      [{ 'direction': 'rtl' }],      // text direction
      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ],
    history: {
      // Local undo shouldn't undo changes
      // from remote users
      userOnly: true
    }
  },
  placeholder: 'Start collaborating...',
  theme: 'snow' // 'bubble' is also great
})

// A Yjs document holds the shared data
const ydoc = new Y.Doc()
// Define a shared text type on the document
const ytext = ydoc.getText('quill');

//create provider
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'my-roomname', ydoc);
wsProvider.on('status', event => {
  console.log(event.status) // logs "connected" or "disconnected"
});

//create awareness to locat cursor
const awareness = wsProvider.awareness;
awareness.on('change', changes => {
  // Whenever somebody updates their awareness information,
  // we log all awareness information from all users.
  console.log(Array.from(awareness.getStates().values()));
})

// You can think of your own awareness information as a key-value store.
// We update our "user" field to propagate relevant user information.
awareness.setLocalStateField('user', {
  // Define a print name that should be displayed
  name: 'Emmanuelle Charpentier',
  // Define a color that should be associated to the user:
  color: '#ffb61e' // should be a hex color
});
// Create an editor-binding which
// "binds" the quill editor to a Y.Text type.
const binding = new QuillBinding(ytext, quill, awareness);
