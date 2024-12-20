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
}

module.exports = Document;