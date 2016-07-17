var async = require('async');
var Room = require('../models/room');
var User = require('../models/user');


module.exports = function(app) {

  app.get('/', function(req, res, next) {
    if (req.user && (req.user.role == 'teacher')) {
      res.render('teacher/dashboard',  { pageTitle: 'Dashboard'});
    } else if (req.user && (req.user.role == 'student')) {
        res.render('student/dashboard');
    } else {
        res.render('main/landing-page');
    }

  });

  /* Log out */
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/message/:id', function(req, res, next) {
    async.waterfall([
      function(callback) {
        User.findOne({ _id: req.params.id }, function(err, foundUser) {
          callback(err, foundUser);
        });

      },
      function(foundUser) {
        Room
        .findOne({ "users": { "$all": [ req.user._id, foundUser._id ] }})
        .populate('messages.creator')
        .exec(function(err, foundRoom) {
          res.render('main/message', { foundUser: foundUser, room: foundRoom });
        });
      }
    ]);

  });

  app.post('/signup', function(req, res) {

    var user = new User();
    user.email = req.body.email;
    user.password = req.body.password;
    user.role = req.body.role;
    user.profile.name = req.body.name;
    user.profile.picture = user.gravatar();

    user.save(function(err) {
      if (err) throw err;
      res.json("success");
    });
  });


}
