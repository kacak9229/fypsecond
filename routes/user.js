var async = require('async');
var passport = require('passport');
var passportConf = require('../passport');
var User = require('../models/user');


module.exports = function(app) {

  /* ---------------------------------------------------- */
  /* STUDENT LOGIN */
  /* ---------------------------------------------------- */

  app.get('/login-student', function(req, res) {
    if (req.user) return res.redirect('/');
    res.render('main/login-student',
    {
      message: "Welcome to Login",
      message: req.flash('loginMessage')
    });
  });

  /* Post Login */
  app.post('/login-student', passport.authenticate('local-login', {
    successRedirect : '/student/dashboard', // redirect to the secure profile section
    failureRedirect : '/login-student', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));


  /* Profile page */
  // app.get('/student/profile', passportConf.isAuthenticated, function(req, res) {
  //   if (req.user) {
  //     User
  //     .findOne({ _id: req.user._id })
  //     .populate('history.item')
  //     .exec(function(err, foundUser) {
  //       if (err) return next(err);
  //
  //       res.render('accounts/profile', { user: foundUser });
  //     });
  //   } else {
  //     res.redirect('/login', { message: 'Please log in!', title: 'Profile' });
  //   }
  // });



  /* ---------------------------------------------------- */
  /* TEACHER LOGIN */
  /* ---------------------------------------------------- */

  app.get('/login-teacher', function(req, res) {
    if (req.user) return res.redirect('/');
    res.render('main/login-teacher',
    {
      message: "Welcome to Login",
      message: req.flash('loginMessage')
    });
  });

  /* Post Login */
  app.post('/login-teacher', passport.authenticate('local-login', {
    successRedirect : '/teacher/dashboard', // redirect to the secure profile section
    failureRedirect : '/login-teacher', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));



    /* ---------------------------------------------------- */
    /* FACEBOOK LOGIN */
    /* ---------------------------------------------------- */

  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/student/dashboard',
                                        failureRedirect: '/login-student' }));

}
