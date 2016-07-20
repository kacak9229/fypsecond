/* Require all the important libraries */
var express = require('express');
var flash = require('express-flash');
var bodyParser = require('body-parser');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo/es5')(session);

var ejs = require('ejs');
var engine = require('ejs-mate');
var mongoose = require('mongoose');

var passport = require('passport');


var config = require('./config');
var User = require('./models/user');

var sessionStore = new MongoStore({ url: config.database, autoReconnect: true });
/*
IO connection
*/
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Connect to MongoDB either use Mongolab
mongoose.connect(config.database, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to the database');
  }
});

/*
Express configuration
*/
app.use(express.static(__dirname + '/public'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret,
  store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});



/* IO file*/
require('./io')(io);

/*
App Routes
*/
require('./routes/main')(app);
require('./routes/user')(app);
require('./routes/student')(app);
require('./routes/teacher')(app, io);


http.listen(process.env.PORT || 3000, function(err) {
  if (err) {
    console.log('Error running express server');
  } else {
    console.log('Running on port 3000');
  }
});
