const User = require('./../models/user.cjs');
const Doc = require('./../models/document.cjs');

class MainPage{
    constructor(){
        this.user = new User();
        this.doc = new Doc();
    }

    async showMainPage(email, req, res){
        try {
            const userCurrentDocList = await this.user.getUserByEmail(email);
            if (userCurrentDocList && userCurrentDocList.document){
                //console.table(userCurrentDocList.document);
                const docCardData = await this.doc.getDocsByRoomIdArray(userCurrentDocList.document);
                //console.log(docCardData);
                res.render('main_page.pug', {docCards : docCardData});
                return;
            }
            res.render('main_page.pug', {docCards : null});
            return;
        } catch (error) {
            console.log("error rendering main page : " + error);
        }
    }
}

module.exports = MainPage;