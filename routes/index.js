const express = require('express');
const router = express.Router();
const striptags = require('striptags')
const moment = require('moment')
const conertPagination = require('../modules/convertPagination')
const firebaseAdminDb = require('../connections/firebase-admin')
const firebase = require('../connections/firebase_client')

const categoriesRef = firebaseAdminDb.ref('categories')
const articlesRef = firebaseAdminDb.ref('articles')

/* GET home page. */
router.get('/', function(req, res) {
  let currentPage = parseInt(req.query.page) || 1 // 目前在第幾頁
  let categories = {}
  categoriesRef.once('value').then(function(snapshot){
    categories = snapshot.val()
    return articlesRef.orderByChild('update_time').once('value')
    
  }).then(function(snapshot){
    let articles = []
    snapshot.forEach(function(snapshotChild){
      if(snapshotChild.val().status === 'public'){
        articles.push(snapshotChild.val())
      }
    })
    articles.reverse()
    // 分頁開始
    const data = conertPagination(articles,currentPage)
    // console.log(data);
    // 分頁結束
    // console.log(categories,articles);
    res.render('index', { 
      "articles":data.data,
      categories,
      striptags,
      moment,
      'page':data.page
    });
  })
});

router.get('/post/:id', function(req, res) {
  const id = req.params['id']
  let categories = {}
  categoriesRef.once('value').then(function(snapshot){
    categories = snapshot.val()
    return articlesRef.child(id).once('value')
  }).then(function(snapshot){
    const article = snapshot.val()
    // console.log(categories,article,id);
    res.render('post',{
      categories,
      article,
      moment
    });
  })
});

module.exports = router;
