require('dotenv').config();
const DocController = require('./controllers/document.cjs');
const MainPage = require('./controllers/mainPage.cjs');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const authentication = require('./routes/authentication.cjs');
const openDoc = require('./routes/openDoc.cjs');
const express = require('express');
const http = require('http');
const WebSocketServer = require('ws').Server;
const Y = require('yjs');
const { MongodbPersistence } = require('y-mongodb-provider');
const { setPersistence, setupWSConnection } = require('./utils.cjs');
const { MongoClient } = require('mongodb');

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
    }
));
app.use('/dist', express.static(path.join(__dirname, 'client', 'dist')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.set('views','./views');

app.get('/', (req, res)=>{
  if(req.session.email){
    res.redirect('/main');
    return;
  }
  res.render('login.pug');
});

//open main page
app.get('/main', async (req, res)=>{
  if(req.session.email){
    const mainPage = new MainPage();
    await mainPage.showMainPage(req.session.email, req, res);
    return;
  }
  res.send("please login");
});

// create new doc
app.post('/new-doc', async (req, res) => {
  if(req.session.email){
    const newDocData = {
      name : req.body['document-name'],
      description : req.body['deskripsi']
    };

    const newDoc = new DocController();
    //create new doc and return its newly created room id
    const newDocRoomId = await newDoc.createNewDoc(req.session.email ,newDocData.name, newDocData.description);
    res.render('quill.pug', {roomId : newDocRoomId, docName : newDocData.name, user: req.session.name});
    return;
  }
  res.send("please login");
});

//check if document exist
app.post('/check-doc', async (req, res) => {
  if(req.session.email){
    const doc = new DocController();
    const docExist = await doc.checkDoc(req.session.email, req.body.roomId);
    if (docExist) {
      res.json({message : "doc exist", roomId : req.body.roomId});
      return;
    }
    res.json({message: "doc doesn't exist"}).status(404);
    return;
  }
  res.send("please login");
});

app.post('/versions', async (req, res)=>{
  const id = req.body.id;
  const doc = new DocController();
  const docVersion = await doc.retrieveDocVersion(id);
  const versionArray = docVersion.version;
  const versionTimeArray = docVersion.time;
  res.status(200).json({versions : versionArray, time : versionTimeArray});
});

app.get('/members', (req, res) => {
  const groupMembers = [
    { NIM: 2201020136, nama: 'Kuncoro Lukito' },
    { NIM: 2201020041, nama: 'Amelia' },
    { NIM: 2201020048, nama: 'Janumelah' },
    { NIM: 2201020019, nama: 'Arinda Amalia Putri' },
    { NIM: 2201020006, nama: 'Lisa Mulyana' },
  ];
  res.render('members', { groupMembers });
});

//open doc
app.use('/open', openDoc);

app.use('/authentication', authentication);

app.get('/logout', (req, res)=>{
  console.log("\x1b[33m user with email " + req.session.email + " has logged out \x1b[0m");
  req.session.destroy();
  res.clearCookie('email');
  res.clearCookie('connect.sid');
  res.clearCookie('document');
  res.redirect('/');
});

app.get("*", (req, res)=>{
  res.send("Incorrect url path");
});

// Create HTTP server from Express app
const server = http.createServer(app);

// y-websocket
const wss = new WebSocketServer({ server });
wss.on('connection', setupWSConnection);


// Connection URL
const url = process.env.MONGO_URL;
// Database Name
const dbName = process.env.dbName;

//connect to mongodb
async function connectToDb() {
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  return { client, db };
}

/*y-mongodb-provider*/
if (!process.env.MONGO_URL) {
	throw new Error('Please define the MONGO_URL environment variable');
}

async function main() {
  const { client, db } = await connectToDb();

  const mdb = new MongodbPersistence({ client, db }, {
    collectionName:'text-editor-data',
    flushSize: 50,
    multipleCollections: false,
  });

  setPersistence({
    bindState: async (docName, ydoc) => {
      const persistedYdoc = await mdb.getYDoc(docName);
      const newUpdates = Y.encodeStateAsUpdate(ydoc);
      //store update to mongodb
      mdb.storeUpdate(docName, newUpdates);//set the initial state
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
      ydoc.on('update', async (update) => {
        mdb.storeUpdate(docName, update);
        //Y.logUpdate(update);
      });
    },
    writeState: async(docName) => {
      const currentState = await mdb.getYDoc(docName);
      mdb.flushDocument(docName);
      //console.log(currentState.getText('quill').toJSON());

      //create a version based on the current doc state after all user disconnected
      const snapshot = Y.snapshot(currentState);
      //console.log("current snapshot\n", snapshot);
      const encodedSnapshot = Y.encodeSnapshot(snapshot);
      //console.log("encoded snapshot", encoded);

      //get the current time
      const now = new Date();

      // Extract day, month, year, hours, and minutes
      const day = String(now.getDate()).padStart(2, '0');  // Add leading zero if single digit
      const month = String(now.getMonth() + 1).padStart(2, '0');  // Months are 0-indexed, so add 1
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');  // Add leading zero if single digit
      const minutes = String(now.getMinutes()).padStart(2, '0');  // Add leading zero if single digit

      // Format the date and time as a string
      const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}`;

      //save encoded version to database
      const document = new DocController();
      await document.addNewVersion(docName, encodedSnapshot, formattedDateTime);
      //console.log(encodedSnapshot);
    },
  });
}

main();

server.listen(1234, 'localhost', () => {
	// eslint-disable-next-line no-console
	console.log(`listening on port: ${"1234"}`);
});