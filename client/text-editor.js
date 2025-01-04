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

//main editor
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
const ydoc = new Y.Doc({gc:false});
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

/*
/
/
/
/
*/
//code for preview
let versionDocArray = [];

const previewEditor = new Quill('#preview-editor', {
    readOnly:true,
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
    placeholder: '...',
    theme: 'bubble' // 'bubble' is also great
})

// A Yjs document for preview
const previewdoc = new Y.Doc({gc:false});
// Define a shared text type on the preview document
const previewtext = ydoc.getText('preview');

const previewBinding = new QuillBinding(previewtext, previewEditor);

// Function to create the HTML structure
function createHistoryItem(version, date, position) {
    // Create the container div
    const container = document.createElement('div');
    container.classList.add('container-fluid', 'py-3', 'border', 'history-item');

    // Create the first paragraph
    const paragraph1 = document.createElement('p');
    paragraph1.textContent = 'Terakhir di edit pada';
    container.appendChild(paragraph1);

    // Create the second paragraph with a small element inside
    const paragraph2 = document.createElement('p');
    const small1 = document.createElement('small');
    small1.classList.add('fst-italic', 'fw-light');
    small1.textContent = date;
    paragraph2.appendChild(small1);
    container.appendChild(paragraph2);

    // Create the version info small element
    const small2 = document.createElement('small');
    small2.style.display = 'block';
    small2.classList.add('fst-italic', 'fw-light');
    small2.textContent = version;
    container.appendChild(small2);

    //create preview button
    const previewButton = document.createElement('button');
    previewButton.classList.add('btn' ,'btn-secondary', 'my-2');
    previewButton.textContent = "Preview";
    previewButton.id = position;
    previewButton.onclick = showpreview;
    container.appendChild(previewButton);

    return container;
}

function insertIntoHistorySideBar(versionArray, versionDateArray){
    const historySideBar = document.getElementById('history');
    if(versionArray){
       for (let i = versionArray.length - 1; i >= 0; i--) {
        let historyItem = createHistoryItem(versionArray[i], versionDateArray[i], i);
        historySideBar.appendChild(historyItem);
        } 
    }else{
        const noHistory = document.createElement('h6');
        noHistory.id = 'supplier-not-found';
        noHistory.classList.add('py-3', 'history-item');
        noHistory.textContent = 'Dokumen ini belum memiliki history';
        historySideBar.appendChild(noHistory);
    }
}

function createVersionArray(count) {
    let versionArray = [];
    
    let major = 1; // Starting with major version 1
    let minor = 0; // Starting with minor version 0
    let patch = 0; // Starting with patch version 0

    for (let i = 1; i <= count; i++) {
        let version = `${major}.${minor}.${patch}`;
        versionArray.push(version);

        // Increment the patch version for each new release
        patch++;

        // Optionally, you can update the minor or major version when certain thresholds are met:
        // For example, every 10 patch increments you could increment the minor version
        if (patch >= 10) {
            patch = 0;    // Reset patch to 0
            minor++;      // Increment minor version
        }
        if (minor >= 10) {
            minor = 0;    // Reset minor to 0
            major++;      // Increment major version
        }
    }

    return versionArray;
}

document.getElementById("open-history").addEventListener("click", function() {
    //program to make that history sidebar is empty before insertion
    const historyItem = document.querySelectorAll('.history-item');
    if(historyItem){
       historyItem.forEach(item => item.remove()); 
    }
    // Get the element with id 'history'
    var historyElement = document.getElementById("history");

    //get the main and preview editor
    const previewEditor = document.getElementById('history-preview');
    const mainEditor = document.getElementById('text-editor');

    //retrieve room id
    const documentRoomIdElement = document.querySelector('.document-room-id');
    const documentRoomId = documentRoomIdElement ? documentRoomIdElement.id : null;

    const xhrClient = new XMLHttpRequest();

    let formData = JSON.stringify({
        id : documentRoomId
    });

    xhrClient.open("POST", '/versions');
    xhrClient.responseType = "json";
    xhrClient.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    xhrClient.send(formData);

    xhrClient.onload = ()=>{
        if(xhrClient.status != 200){
            alert('Error: ' + xhrClient.status + 'error retrieving document version');
            return;
        }
        let response = xhrClient.response.versions;
        //console.log(response.versions);
        let versionTime = xhrClient.response.time;
        const versionArray = response.map(base64String => {
            const binaryString = atob(base64String); // Decode the base64 string
            const uint8Array = new Uint8Array(binaryString.length);
        
            // Convert the binary string to Uint8Array
            for (let i = 0; i < binaryString.length; i++) {
              uint8Array[i] = binaryString.charCodeAt(i);
            }
            return uint8Array;
        });
        
        //array of uint8 that hold doc state for every version
        versionDocArray = versionArray;

        const numericVersion = createVersionArray(versionTime.length);
        insertIntoHistorySideBar(numericVersion, versionTime);
        // console.log(versionArray);
        // console.log(versionTime);
        // console.log(createVersionArray(versionTime.length));
    }

    // Remove 'd-none' class and add 'd-block' class
    historyElement.classList.remove("d-none");
    historyElement.classList.add("d-block");
    previewEditor.classList.remove("d-none");
    previewEditor.classList.add("d-block");
    mainEditor.classList.remove("d-block");
    mainEditor.classList.add("d-none");
});

document.getElementById("close-history").addEventListener("click", function() {
    //get the main and preview editor
    const previewEditor = document.getElementById('history-preview');
    const mainEditor = document.getElementById('text-editor');

    const historyItem = document.querySelectorAll('.history-item');
    if(historyItem){
       historyItem.forEach(item => item.remove()); 
    }
    // Get the element with id 'history'
    var historyElement = document.getElementById("history");
    
    // Remove 'd-none' class and add 'd-block' class
    historyElement.classList.remove("d-block");
    historyElement.classList.add("d-none");
    previewEditor.classList.remove("d-block");
    previewEditor.classList.add("d-none");
    mainEditor.classList.remove("d-none");
    mainEditor.classList.add("d-block");

});

function showpreview(event){
    event.preventDefault();
    let id = event.target.id;

    const decodedVersion = Y.decodeSnapshot(versionDocArray[id]);
    console.log(decodedVersion);
    
    const docRestored = Y.createDocFromSnapshot(ydoc, decodedVersion);
    docRestored.getMap("root"); // need to touch top-level type for toJSON to work
    console.log("state restored snapshot", docRestored.getText('quill').toDelta());
    
    //////
    const delta = docRestored.getText('quill').toDelta(); // Get the Quill Delta format from Y.Text

    // Insert the content into the Quill editor
    previewEditor.setContents(delta);
}