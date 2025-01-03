const { MongoClient } = require('mongodb');
require('dotenv').config();

class DatabaseService {
    constructor() {
        this.client = new MongoClient(process.env.MONGO_URL);
        this.database = null;
    }

    async connect() {
        if (!this.database) {
            await this.client.connect();
            this.database = this.client.db(process.env.dbName); // Replace with your database name
        }
        return this.database;
    }

    async close() {
        if (this.client) {
            await this.client.close();
            this.database = null;
        }
    }
}

class UserService {
    constructor(dbService) {
        this.dbService = dbService;
    }

    async insertNewUser(userName, userEmail, userPassword) {
        try {
            const db = await this.dbService.connect();
            const users = db.collection("users");

            const user = {
                name: userName,
                email: userEmail,
                password: userPassword,
                document: null
            };

            const result = await users.insertOne(user);
            console.log("\x1b[32m" +`User inserted with _id: ${result.insertedId}` + "\x1b[32m");
        } catch (error) {
            console.error("Error inserting user:", error);
        }
    }

    async getUserByEmail(email) {
        try {
            const db = await this.dbService.connect();
            const users = db.collection("users");

            const user = await users.findOne({ email: email });
            if (user) {
                console.log("User found:");
                //console.log(user);
                return user;
            } else {
                console.log("No user found with the specified email.");
                return null;
            }
        } catch (error) {
            console.error("Error retrieving user:", error);
        }
    }

    async updateUserDocument(email, newDocumentArray) {
        try {
            const db = await this.dbService.connect();
            const users = db.collection("users");

            const filter = { email: email }; // Filter by email
            const update = { $set: { document: newDocumentArray } }; // Set the 'document' field to the new array

            const result = await users.updateOne(filter, update);
            if (result.matchedCount > 0) {
                console.log(`User with email '${email}' updated successfully.`);
            } else {
                console.log(`No user found with email '${email}'.`);
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }

    async getUserByEmailAndPassword(email, password) {
        try {
            const db = await this.dbService.connect();
            const users = db.collection("users");

            const user = await users.findOne({ email: email, password: password });
            if (user) {
                console.log("User found:");
                //console.log(user);
                return user; // Return the user object
            } else {
                console.log("No user found with the specified email and password.");
                return null; // Return null if no user is found
            }
        } catch (error) {
            console.error("Error retrieving user:", error);
            return null; // Return null in case of an error
        }
    }
}

class DocumentService{
    constructor(dbService) {
        this.dbService = dbService;
    }

    async createNewDocument(room_id, name, description){
        try {
            const db = await this.dbService.connect();
            const docs = db.collection("documents");

            const newDoc = {
                'roomId': room_id,
                'name': name,
                'description': description
            };

            const result = await docs.insertOne(newDoc);
            console.log("\x1b[32m" +`a document created with _id: ${result.insertedId}` + "\x1b[0m");
        } catch (error) {
            console.error("Error creating document:", error);
        }
    }

    async getDocByRoomId(roomId){
        try {
            const db = await this.dbService.connect();
            const docs = db.collection("documents");

            const doc = await docs.findOne({ roomId: roomId });
            if (doc) {
                console.log(" document specified room id found ");
                //console.log(user);
                return doc;
            } else {
                console.log("No document found with the specified roomId.");
                return null;
            }
        } catch (error) {
            console.error("getDocByRoomId log => Error retrieving document:", error);
        }
    }

    async getDocsByRoomIds(roomIdArray) {
        try {
            const db = await this.dbService.connect();
            const docs = db.collection("documents");

            const documents = await docs.find({ roomId: { $in: roomIdArray } }).toArray();
            console.log(`Retrieved ${documents.length} documents for the given roomId Array.`);
            return documents;
        } catch (error) {
            console.error("Error retrieving documents by roomIds:", error);
        }
    }

    async createVersioning(room_id){
        try {
            const db = await this.dbService.connect();
            const docs = db.collection("doc-version");

            const newDoc = {
                '_id': room_id,
                'version': null
            };

            const result = await docs.insertOne(newDoc);
            console.log("\x1b[32m" +`a versioning document created with _id: ${result.insertedId}` + "\x1b[0m");
        } catch (error) {
            console.error("Error creating new versioning document: ", error);
        }
    }

    async addNewVersion(id, newVersionArray){
        try {
            const db = await this.dbService.connect();
            const users = db.collection("doc-version");

            const filter = { _id: id }; // Filter by id
            const update = { $set: { version: newVersionArray } }; //insert the new array of version

            const result = await users.updateOne(filter, update);
            if (result.matchedCount > 0) {
                console.log(`versioning doc with id '${id}' updated successfully.`);
            } else {
                console.log(`No versioning doc with id '${id}'.`);
            }
        } catch (error) {
            console.error("Error add new doc version:", error);
        }
    }

    async retrieveVersionArray(id){
        try {
            const db = await this.dbService.connect();
            const docs = db.collection("doc-version");

            const doc = await docs.findOne({ _id: id });
            if (doc) {
                console.log("versioning document with specified room id retrieved");
                //console.log(doc);
                return doc;
            } else {
                console.log("No versioning document found with the specified roomId.");
                return null;
            }
        } catch (error) {
            console.error("retrieveVersionArray log => Error retrieving versioning document:", error);
        }
    }
}

module.exports = {DatabaseService, UserService, DocumentService};