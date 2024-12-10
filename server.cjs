require('dotenv').config();
const http = require('http');
const WebSocketServer = require('ws').Server;
const Y = require('yjs');
const { MongodbPersistence } = require('y-mongodb-provider');
const { setPersistence, setupWSConnection } = require('./utils.cjs');
const { MongoClient } = require('mongodb');

const server = http.createServer((request, response) => {
	response.writeHead(200, { 'Content-Type': 'text/plain' });
	response.end('okay');
});
// y-websocket
const wss = new WebSocketServer({ server });
wss.on('connection', setupWSConnection);


// Connection URL
const url = '';
// Database Name
const dbName = '';

//connect to mongodb
async function connectToDb() {
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);
  return { client, db };
}

/*y-mongodb-provider*/
// if (!process.env.MONGO_URL) {
// 	throw new Error('Please define the MONGO_URL environment variable');
// }

async function main() {
  const { client, db } = await connectToDb();

  const mdb = new MongodbPersistence({ client, db }, {
    collectionName:'text-editor-data',
    flushSize: 500,
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

server.listen(1234, () => {
	// eslint-disable-next-line no-console
	console.log(`listening on port: ${"1234"}`);
});