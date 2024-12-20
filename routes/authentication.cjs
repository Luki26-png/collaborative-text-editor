const express = require('express');
const authentication = express.Router();
const AuthController = require('./../controllers/authController.cjs');
authentication.use('/public', express.static( __dirname + '/../public'));

//login
authentication.post('/login', async (req, res)=>{
  const loginData = {
    email : req.body.email,
    password : req.body.password
  };
  const authController = new AuthController();
  const user = await authController.Login(loginData.email, loginData.password);
  if (user) {
    //console.table(user);
    res.cookie('name', user.name);
    res.cookie('email', user.email);
    res.cookie('document', user.document);
    req.session.name = user.name;
    req.session.email = user.email;
    req.session.document = user.document;
    console.log("\x1b[33m user with email " + user.email + " has logged in \x1b[0m")
    res.status(200).json({message: "authenticated"});
  }else{
    res.status(401).json({message: "user not found"});
  }
});

//send register page
authentication.get('/register', (req, res)=>{
  if(req.session.email){
    res.redirect('/main');
    return;
  }
  res.render('register.pug');
});

//register process
authentication.post('/register', async (req, res)=>{
  const userData = {
    name: req.body.nama,
    email: req.body.email,
    password: req.body['kata-sandi']
  };
  const authController = new AuthController();
  await authController.register(userData.name, userData.email, userData.password);
  res.cookie('name', userData.name);
  res.cookie('email', userData.email);
  res.cookie('document', null);
  req.session.name = userData.name;
  req.session.email = userData.email;
  req.session.document = null;
  res.redirect('/main');
});

module.exports = authentication;