var async = require('async');

var passportConf = require('../passport');
var User = require('../models/user');
var Course = require('../models/course');

module.exports = function(app) {

  app.get('/student/dashboard', passportConf.requireRole('student'), function(req, res, next){
    res.render('student/dashboard');
  });

  app.get('/student/my-courses', function(req, res, next) {
    User.findOne({ _id: req.user._id })
      .populate('courses.course')
      .exec(function(err, foundUser) {
        if (err) {
          return next(err);
        } else {
          console.log(foundUser)
          res.render('student/my-courses', { foundUser: foundUser });
        }
      })
  });

  app.get('/student/my-courses/:id', function(req, res, next) {
    Course.findOne({ _id: req.params.id })
        .populate('ownByTeacher')
        .exec(function(err, course) {
          if (err) return next(err);
            res.render('student/single-student-course', { pageTitle: course.name, course: course });
        });
  });

  app.get('/student/join-course', function(req, res, next) {
    Course.find({}, function(err, foundCourses) {
      if (foundCourses) {
        res.render('student/join-course', { courses: foundCourses});
      }
    });
  });

  app.route('/student/courses/:id')
    .get(function(req, res, next) {
      Course.findOne({ _id: req.params.id }, function(err, foundCourse) {
        res.render('student/single-course', { course: foundCourse });
      });
    })
    .post(function(req, res, next) {
      async.parallel([

        function(callback) {
          Course.update(
    					{
    						_id: req.params.id,
    						'ownByStudent.user': { $ne: req.user._id }
    					},
    					{
    						$push: { ownByStudent: { user: req.user._id } },
    						$inc: { totalStudents: 1}
    					}, function(err, count) {
    						if (err) return next(err);
    						callback(err);
    				});
        },
        function(callback) {
          User.update(
    					{
    						_id: req.user._id,
    						'courses.course': { $ne: req.params.id }
    					},
    					{
    						$push: { courses: { course: req.params.id } },
    					}, function(err, count) {
    						if (err) return next(err);
    						callback(err);
    				});
        }
      ], function(err, results) {
        if (err) {
          return next(err);
        } else {
          res.redirect('/student/my-courses/' + req.params.id);
        }
      });
    });


  /* GET --> For Edit profile */
  app.get('/student/profile', function(req, res) {
    res.render('student/profile.ejs', { message: req.flash('success')});
  });

  /* POST --> For edit data */
  app.post('/student/edit-profile', function(req, res) {
    User.findOne({ _id: req.user._id }, function(err, user) {
      if (err) return next(err);

      user.profile.name = req.body.name;
      // user.profile.picture =
      user.address = req.body.address;
      user.save(function(err) {
        if (err) return next(err);
        req.flash('success', 'Successfully Edited your profile');
        return res.redirect('/edit-profile');
      });
    });
  });

}
