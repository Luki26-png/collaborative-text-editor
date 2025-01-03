const { DatabaseService, DocumentService } = require('../configs/db.cjs');

class Document{
    constructor() {
        this.dbService = new DatabaseService();
        this.docService = new DocumentService(this.dbService);
    }

    async createNewDoc(room_id, name, description){
        try {
            await this.docService.createNewDocument(room_id, name, description);
        } catch (error) {
            throw new Error('Error creating new documents : ' + error.message);
        }
    }

    async getDocByRoomId(roomId){
        try {
            return await this.docService.getDocByRoomId(roomId);
        } catch (error) {
            console.error("Error retrieving document:", error);
        }
    }

    async getDocsByRoomIdArray(roomIdArray){
        try {
            return await this.docService.getDocsByRoomIds(roomIdArray);
        } catch (error) {
            console.error("Error retrieving document by array of id:", error);
        }
    }

    async createVersioningDoc(room_id){
        try {
            await this.docService.createVersioning(room_id);
        } catch (error) {
            throw new Error('Error creating new versioning doc: ' + error.message);
        }
    }

    async retrieveVersion(id){
        try {
            const versionsDoc = await this.docService.retrieveVersionArray(id);
            return versionsDoc.version;
        } catch (error) {
            console.error("Error retrieving versioning document with specified id from model:", error);
        }
    }

    async addNewVersion(id, newVersionArray){
        try {
            await this.docService.addNewVersion(id, newVersionArray);
        } catch (error) {
            throw new Error('Error adding a new versioning doc: ' + error.message);
        }
    }
}

module.exports = Document;