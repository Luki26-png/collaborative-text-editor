const User = require('./../models/user.cjs');
const Doc = require('./../models/document.cjs');

class DocumentController{
    constructor(){
        this.user = new User();
        this.doc = new Doc();
    }

    createDocRoomId(length = 5){
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            result += chars.charAt(randomIndex);
        }
        return result;
    }

    async updateUserDocList(email, roomId){
        try {
            //get user current doc list
            const user = await this.user.getUserByEmail(email);
            let userCurrDoc = user.document;
            if (userCurrDoc) {//if user current doc is not empty
                if(!userCurrDoc.includes(roomId)){
                   //add room id to the list if it do not exist in it 
                   userCurrDoc.push(roomId); 
                }
            }else{
                userCurrDoc = [roomId];//if user current doc is empty
            }
            //update user doc lists
            await this.user.updateUserDocument(email, userCurrDoc);
        } catch (error) {
            console.log(`Fail to update user doc lists : ${error}`);
        }
    }

    async createNewDoc(email, name, description){
        //create room id
        const roomId = this.createDocRoomId();
        
        try {
            //create new doc
            this.doc.createNewDoc(roomId, name, description);
            this.doc.createVersioningDoc(roomId);
            //update user doc list
            await this.updateUserDocList(email, roomId);
            //return the document room id
            return roomId;
        } catch (error) {
            throw new Error('Error creating new documents : ' + error.message);
        }
    }

    async checkDoc(email, roomId){
        try {
            //check if the doc with specified room id exist
            const docExist = await this.doc.getDocByRoomId(roomId);
            if (docExist) {
                //update the user doc list
                await this.updateUserDocList(email, roomId);
                return docExist;
            }
            return null;
        } catch (error) {
            throw new Error('Error join existing doc : ' + error.message);
        }
    }

    async addNewVersion(id, currentSnapshot, currentTime){
        try {
            let currentDoc = await this.doc.retrieveVersion(id);
            let currentVersionArray = currentDoc.version;
            let currentVersionTimeArray = currentDoc.time; 
            if(currentVersionArray){
                currentVersionArray.push(currentSnapshot);
                currentVersionTimeArray.push(currentTime);
            }else{
                currentVersionArray = [currentSnapshot];
                currentVersionTimeArray = [currentTime];
            }
            await this.doc.addNewVersion(id, currentVersionArray, currentVersionTimeArray);
            //console.log(currentVersionArray);
        } catch (error) {
            throw new Error('Error creating new doc version : ' + error.message);
        }
    }

    async retrieveDocVersion(id){
        try {
            return await this.doc.retrieveVersion(id);
        } catch (error) {
            throw new Error('Error retrieving doc version : ' + error.message)
        }
    }
}

module.exports = DocumentController;
// const tes = new Document();
// console.log(tes.createDocRoomId());