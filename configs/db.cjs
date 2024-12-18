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
            console.log(`User inserted with _id: ${result.insertedId}`);
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
                console.log(user);
            } else {
                console.log("No user found with the specified email.");
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
}

module.exports = {DatabaseService, UserService};