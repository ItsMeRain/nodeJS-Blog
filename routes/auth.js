const express = require('express');
const router = express.Router();
const striptags = require('striptags')
const moment = require('moment')
const firebaseAdminDb = require('../connections/firebase-admin')
const firebase = require('../connections/firebase_client');
const firebaseAuth = require("firebase/auth");
const auth = firebaseAuth.getAuth();


router.get('/signup', function(req, res) {
  const error = req.flash('error')
  res.render('dashboard/signup',{
    error,
    hasInfo:error.length > 0
  });
});

router.get('/signin', function(req, res) {
  const error = req.flash('error')
  res.render('dashboard/signin',{
    error,
    hasInfo:error.length > 0
  });
});

router.get('/signout', function(req, res) {
  req.session.uid = ''
  res.redirect('/auth/signin')
});

router.post('/signup', function (req, res) {
  const email = req.body.email
  const password = req.body.password
  const confirm_password = req.body.confirm_password
  if(password !== confirm_password){
    req.flash('error','兩個密碼輸入不符合')
    res.redirect('/auth/signup')
  }else{
    firebaseAuth.createUserWithEmailAndPassword(auth, email, password)
    .then(function(UserCredential){
      // console.log(UserCredential);
        const saveUser = {
          'email':email,
          'uid': UserCredential.user.uid
        }
        firebaseAdminDb.ref(`/user/${UserCredential.user.uid}`).set(saveUser)
        res.redirect('/auth/signin')
    })
    .catch(function(error){
        console.log(error);
        req.flash('error',error.message)
        res.redirect('/auth/signup')
    })
  }
  
})

router.post('/signin', function (req, res) {
  const email = req.body.email
  const password = req.body.password
  firebaseAuth.signInWithEmailAndPassword(auth, email, password)
  .then(function(UserCredential){
    req.session.uid = UserCredential.user.uid
    req.session.email = req.body.email
    res.redirect('/dashboard')
  })
  .catch(function(error){
    req.session.uid = ''
    req.flash('error','登入失敗')
    res.redirect('/auth/signin')
  })
})

module.exports = router;
