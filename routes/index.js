const express = require('express');
const router = express.Router();
const striptags = require('striptags')
const moment = require('moment')
const conertPagination = require('../modules/convertPagination')
const firebaseSort = require('../modules/firebaseSort')
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
    // 分頁
    const data = conertPagination( articles, currentPage)
    res.render('index', { 
      'articles':data.data,
      categories,
      'categoryId':null,
      striptags,
      moment,
      'pagination':data.page
    });
  })
});

router.get('/archives/:categories', function(req, res) {
  const categoryPath = req.params['categories']
  const currentPage = parseInt(req.query.page) || 1 // 目前在第幾頁
  let categories = {}
  let categoryId = ''
  categoriesRef.once('value').then(function(snapshot){
    // 全部分類
    categories = snapshot.val()
    // 取得單一分類
    categoryId = firebaseSort.byPath(snapshot,categoryPath)
    return articlesRef.orderByChild('update_time').once('value')
  }).then(function(snapshot){
    // 篩選資料分類
    const sortData = firebaseSort.byData(snapshot,categoryId)
    // 分頁
    const articles = conertPagination( sortData, currentPage,`archives/${categoryPath}?`)
    res.render('archives', { 
      'articles':articles.data,
      categories,
      categoryId,
      striptags,
      moment,
      'pagination':articles.page
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
    const categoryId = snapshot.val().category
    res.render('post',{
      categories,
      categoryId,
      article,
      moment
    });
  })
});

module.exports = router;
