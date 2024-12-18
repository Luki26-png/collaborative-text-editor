const express = require('express');
const authentication = express.Router();
authentication.use('/public', express.static( __dirname + '/../public'));

//login
authentication.post('/login', (req, res)=>{
  res.send("ok");
});
//send register page
authentication.get('/register', (req, res)=>{
  res.render('register.pug');
});
//register process
authentication.post('/register', (req, res)=>{
  res.send('ok');
});

module.exports = authentication;