import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { WebsocketProvider } from 'y-websocket';
import  ImageResizor  from 'quill-image-resizor';

function generateDarkHexColor() {
  // Generate random values for R, G, B in a low range (0-127)
  const r = Math.floor(Math.random() * 128); // 0-127
  const g = Math.floor(Math.random() * 128); // 0-127
  const b = Math.floor(Math.random() * 128); // 0-127

  // Convert to hexadecimal and pad with 0 if needed
  const hex = (value) => value.toString(16).padStart(2, '0');

  // Combine the RGB values into a hex color string
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

ImageResizor.Quill = Quill
Quill.register('modules/cursors', QuillCursors);
Quill.register('modules/imageResizor', ImageResizor);

const quill = new Quill('#editor', {
  modules: {
    imageResizor:{},
    cursors: true,
    toolbar: [
      // adding some Quill content features
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}],
      ['link', 'image'],
      [{ 'header': 1 }, { 'header': 2 }],   // custom button values
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
  placeholder: 'Mulai Berkolaborasi...',
  theme: 'snow' // 'bubble' is also great
})

// Retrieve the id of the element with class .document-room-id
const documentRoomIdElement = document.querySelector('.document-room-id');
const documentRoomId = documentRoomIdElement ? documentRoomIdElement.id : null;

// Retrieve the id of the element with class .user-name
const userNameElement = document.querySelector('.user-name');
const userNameId = userNameElement ? userNameElement.id : null;

// A Yjs document holds the shared data
const ydoc = new Y.Doc({gc:true});
// Define a shared text type on the document
const ytext = ydoc.getText('quill');

//create provider
const wsProvider = new WebsocketProvider('ws://' + window.location.host, documentRoomId, ydoc);
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
  name: userNameId,
  // Define a color that should be associated to the user:
  color: generateDarkHexColor() // should be a hex color
});
// Create an editor-binding which
// "binds" the quill editor to a Y.Text type.
const binding = new QuillBinding(ytext, quill, awareness);
