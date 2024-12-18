const { DatabaseService, UserService } = require('../configs/db');

class User{
    constructor() {
        this.dbService = new DatabaseService();
        this.userService = new UserService(this.dbService);
    }

    // Insert a new user into the database
    async insertNewUser(userName, userEmail, userPassword) {
        try {
            await this.userService.insertNewUser(userName, userEmail, userPassword);
        } catch (error) {
            throw new Error('Error inserting user: ' + error.message);
        }
    }

    // Get user by email from the database
    async getUserByEmail(email) {
        try {
            return await this.userService.getUserByEmail(email);
        } catch (error) {
            throw new Error('Error retrieving user: ' + error.message);
        }
    }

    // Update user document field
    async updateUserDocument(email, newDocumentArray) {
        try {
            await this.userService.updateUserDocument(email, newDocumentArray);
        } catch (error) {
            throw new Error('Error updating user document: ' + error.message);
        }
    }
}

module.exports = new User();
