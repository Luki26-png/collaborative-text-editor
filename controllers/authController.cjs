const User = require('./../models/user.cjs');

class Authentication{
    constructor(){
        this.user = new User();
    }

    async register(userName, userEmail, userPassword){
        await this.user.insertNewUser(userName, userEmail, userPassword);
        return 1;
    }

    async Login(email, password){
        try {
            return await this.user.getUserByEmailAndPassword(email, password);
        } catch (error) {
            console.error("Error login : ", error);
        }
    }
}

module.exports = Authentication;