require('dotenv').config();
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const authentication = require('./routes/authentication.cjs');
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
  res.render('login.pug');
});

app.get('/main', (req, res)=>{
  res.render('main_page.pug');
});

// Simple route for health check
app.get('/text', (req, res) => {
  res.render('quill.pug');
});

app.use('/authentication', authentication);

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
    flushSize: 100,
    multipleCollections: false,
  });

  setPersistence({
    bindState: async (docName, ydoc) => {
      const persistedYdoc = await mdb.getYDoc(docName);
      const newUpdates = Y.encodeStateAsUpdate(ydoc);
      mdb.storeUpdate(docName, newUpdates);
      Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
      ydoc.on('update', async (update) => {
        mdb.storeUpdate(docName, update);
      });
    },
    writeState: () => {
      return new Promise((resolve) => {
        resolve(true);
      });
    },
  });
}

main();

server.listen(1234, 'localhost', () => {
	// eslint-disable-next-line no-console
	console.log(`listening on port: ${"1234"}`);
});