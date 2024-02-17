const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/index');
const dashboard = require('./routes/dashboard');
const auth = require('./routes/auth');
const flash = require('connect-flash');
const session = require('express-session');
const { log } = require('console');
const app = express();
require('dotenv').config()


// view engine setup
app.engine('ejs', require('express-ejs-extend'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 3600 * 1000 }
}));
app.use(flash());

const authCheck = function(req,res,next){
  if(req.session.uid === process.env.ADMIN_UID){
    return next()
  }
  res.redirect('/auth/signin')
}



app.use('/', indexRouter);
app.use('/dashboard',authCheck, dashboard);
app.use('/auth', auth);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{
    title:'您所搜尋的頁面不存在'
  });
});

module.exports = app;
