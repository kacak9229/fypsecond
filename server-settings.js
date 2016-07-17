/* Require all the important libraries */
var express = require('express');
var flash = require('express-flash');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo/es5')(session);

var ejs = require('ejs');
var engine = require('ejs-mate');
var mongoose = require('mongoose');

var passport = require('passport');
var passportSocketIo = require("passport.socketio");

var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


var config = require('./config');
var User = require('./models/user');

var sessionStore = new MongoStore({ url: config.database, autoReconnect: true });
/*
IO connection
*/
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// S3 config
var fs = require('fs'),
    S3FS = require('s3fs'),
    s3fsImpl = new S3FS('naufals3nodejsbucket', {
        accessKeyId: 'AKIAIPNE4WAGZ5X5FJTA',
        secretAccessKey: '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'
    });

// Create our bucket if it doesn't exist
s3fsImpl.create();



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

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same middleware you registrer in express
  key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       config.secret,    // the session_secret to parse the cookie
  store:        sessionStore,        // we NEED to use a sessionstore. no memorystore please
  success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
  fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));


function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  // OR

  // If you use socket.io@1.X the callback looks different
  accept();
}

function onAuthorizeFail(data, message, error, accept){
  console.log('failed connection to socket.io:', message);
  // If you use socket.io@1.X the callback looks different
  // If you don't want to accept the connection
  if(error)
    accept(new Error(message));
  // this error will be sent to the user as a special error-package
  // see: http://socket.io/docs/client-api/#socket > error-object
}


/* IO file*/
require('./io')(io);

/*
App Routes
*/
require('./routes/main')(app);
require('./routes/user')(app);
require('./routes/student')(app);
require('./routes/teacher')(app, io);
app.use(multipartMiddleware);
require('./api/api')(app, s3fsImpl);


http.listen(process.env.PORT || 3000, function(err) {
  if (err) {
    console.log('Error running express server');
  } else {
    console.log('Running on port 3000');
  }
});
