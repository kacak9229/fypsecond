// Facebook, Github, Twitter Login
// var moment = require('moment');
var passport = require('passport');
var async = require('async');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var config = require('./config');
var User = require('./models/user');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

/*
Sign in using Email and Password
*/
passport.use('local-login', new LocalStrategy({
  // by default, local strategy uses username and password, we will override with email
  usernameField : 'email',
  passwordField : 'password',
  passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, email, password, done) { // callback with email and password from our form

  // find a user whose email is the same as the forms email
  // we are checking to see if the user trying to login already exists
  User.findOne({ email:  email }, function(err, user) {
    // if there are any errors, return the error before anything else
    if (err)
    return done(err);

    // if no user is found, return the message
    if (!user)
    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

    // if the user is found but the password is wrong
    if (!user.comparePassword(password))
    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

    // all is well, return successful user
    return done(null, user);
  });

}));

passport.use(new FacebookStrategy(
  config.facebook,
  // facebook will send back the token and profile
  function(token, refreshToken, profile, done) {
    console.log(profile);


    // find the user in the database based on their facebook id
    User.findOne({ facebook : profile.id }, function(err, user) {

      if (err)
      return done(err);
      if (user) {
        return done(null, user);
      } else {

            var newUser = new User();
            newUser.role = "student";
            newUser.email = profile._json.email;
            newUser.facebook = profile.id;
            newUser.tokens.push({ kind: 'facebook', token: token });
            newUser.profile.name = profile.displayName;
            newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
            newUser.save(function(err) {
              if (err)
              throw err;
              return done(err, newUser);
            });
      }
    });
  }));



exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login');
}

exports.requireRole = function(role) {
   return function(req, res, next) {
        if(req.user && req.user.role === role)
            next();
        else
            res.render('errors/404');
    }
}
