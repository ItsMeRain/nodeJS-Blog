const express = require('express');
const router = express.Router();
const striptags = require('striptags')
const moment = require('moment')
const conertPagination = require('../modules/convertPagination')
const firebaseAdminDb = require('../connections/firebase-admin')
const firebase = require('../connections/firebase_client');

const categoriesRef = firebaseAdminDb.ref('categories')
const articlesRef = firebaseAdminDb.ref('articles')

router.get('/', function(req, res) {
  let articleTotal = 0
  let articlePublicTotal = 0
  let articleDraftotal = 0
  articlesRef.once('value').then(function(snapshot){
    snapshot.forEach(function(snapshotChild){
      articleTotal++
      if(snapshotChild.val().status==="public"){
        articlePublicTotal++
      }else if(snapshotChild.val().status==="draft"){
        articleDraftotal++
      }
    })
    res.render('dashboard/index',{
      currentPath:"/index",
      articleTotal,
      articlePublicTotal,
      articleDraftotal
    });
  })
});

router.get('/archives', function(req, res) {
  let currentPage = parseInt(req.query.page) || 1 // 目前在第幾頁
  const status = req.query.status ||'public'
  let categories = {}
  categoriesRef.once('value').then(function(snapshot){
    categories = snapshot.val()
    return articlesRef.orderByChild('update_time').once('value')
    
  }).then(function(snapshot){
    let articles = []
    snapshot.forEach(function(snapshotChild){
      if(status === snapshotChild.val().status){
        articles.push(snapshotChild.val())
      }
    })
    articles.reverse()
    const data = conertPagination( articles, currentPage, `dashboard/archives?status=${status}&`, 8 )
    res.render('dashboard/archives', {
      currentPath:"/archives", 
      'articles':data.data,
      categories,
      striptags,
      moment,
      status,
      'pagination':data.page
    });
  })

});

router.get('/article/creat', function(req, res) {
  categoriesRef.once('value').then(function(snapshot){
    const categories = snapshot.val()
    res.render('dashboard/article', {
      currentPath:"/article",
      categories
      });
  })
});

router.get('/article/:id', function(req, res) {
  const id = req.params['id']
  let categories = {}
  categoriesRef.once('value').then(function(snapshot){
    categories = snapshot.val()
    return articlesRef.child(id).once('value')
  }).then(function(snapshot){
    const article = snapshot.val()
    res.render('dashboard/article', {
      currentPath:"/article", 
      categories,
      article
      });
  })
});

router.get('/categories', function(req, res) {
  const message = req.flash('info')
  categoriesRef.once('value').then(function(snapshot){
    const categories = snapshot.val()
    res.render('dashboard/categories', {
      currentPath:"/categories", 
      message,
      hasInfo: message.length > 0,
      categories
      });
  })

});

router.post('/article/creat', function(req, res) {
  const articleRef = articlesRef.push()
  const key = articleRef.key
  const updateTime = Math.floor(Date.now() / 1000)
  const data = {
    'title':req.body.title,
    'content':req.body.content,
    'category':req.body.category,
    'status':req.body.status,
    'id':key,
    'update_time':updateTime
  }
  articleRef.set(data).then(function(){
    res.redirect(`/dashboard/article/${key}`);
  })
});

router.post('/article/delete/:id', function(req, res) {
  const id = req.params['id']
  articlesRef.child(id).remove().then(function(){
    res.send('後端文章已刪除')
    res.end()
  })
});

router.post('/article/update/:id', function(req, res) {
  const id = req.params['id']
  const updateTime = Math.floor(Date.now() / 1000)
  const data = {
    'title':req.body.title,
    'content':req.body.content,
    'category':req.body.category,
    'status':req.body.status,
    'update_time':updateTime
  }
  articlesRef.child(id).update(data).then(function(){
    res.redirect(`/dashboard/article/${id}`);
  })
});

router.post('/categories/create', function(req, res) {
  const categoryRef = categoriesRef.push()
  const key = categoryRef.key
  const data ={
    'name':req.body.name,
    'path':req.body.path,
    'id':key
  }

  categoriesRef.orderByChild('path').equalTo(data.path).once('value')
  .then(function(snapshot){
    if(snapshot.val() !== null){
      req.flash('info','已有相同路徑')
      res.redirect('/dashboard/categories');
    }else{
      categoryRef.set(data).then(function() {
        req.flash('info','分類已新增')
        res.redirect('/dashboard/categories');
      })
    }
  })
});

router.post('/categories/update/:id', function(req, res) {
  const id = req.params['id']
  const path = req.body[req.params['id']]
  const data = {
    'path':path
  }
  categoriesRef.child(id).update(data).then(function(){
    res.redirect(`/dashboard/categories`);
  })
});

router.post('/categories/delete/:id', function(req, res) {
  const id = req.params['id']
  categoriesRef.child(id).remove().then(function(){
    req.flash('info','欄位已刪除')
    res.redirect('/dashboard/categories');
  })
});






module.exports = router;
