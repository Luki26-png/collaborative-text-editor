const express = require('express');
const path = require('path');
const DocController = require('./../controllers/document.cjs');
const openDoc = express.Router();
openDoc.use('/dist', express.static(path.join(__dirname,'..', 'client', 'dist')));

openDoc.get('/:roomId', async (req, res)=>{
    if(req.session.email){
      const roomId = req.params.roomId;
      const doc = new DocController();
      const docExist = await doc.checkDoc(req.session.email, roomId);
      res.render('quill.pug', {roomId : roomId, docName : docExist.name, user:req.session.name});
    }
});

module.exports = openDoc;