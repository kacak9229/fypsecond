var async = require('async');

var User = require('../models/user');
var Course = require('../models/course');
var passportConf = require('../passport');

module.exports = function(app, io) {

  app.get('/teacher/dashboard', passportConf.requireRole('teacher'), function(req, res, next) {
    res.render('teacher/dashboard', { pageTitle: 'Dashboard'});
  });

  app.get('/teacher/calendar', passportConf.requireRole('teacher'), function(req, res, next) {
    res.render('teacher/calendar', { pageTitle: 'Calendar'});
  });

  app.get('/teacher/mycourse', passportConf.requireRole('teacher'), function(req, res, next) {
    User.findOne({ _id: req.user._id })
      .populate('courses.course')
      .exec(function(err, foundUser) {
        if (err) return next(err);
        res.render('teacher/mycourse', { pageTitle: 'My Courses', foundUser: foundUser });
      });
  });

  app.get('/teacher/mycourse/:id', passportConf.requireRole('teacher'), function(req, res, next) {
    Course.findOne({ _id: req.params.id })
        .populate('ownByStudent.user')
        .exec(function(err, course) {
          if (err) return next(err);

            res.render('teacher/single-teacher-course', { pageTitle: course.name, course: course });
        });
  });

  app.route('/teacher/create-course')

    .get(passportConf.requireRole('teacher'), function(req, res, next) {
        res.render('teacher/create-course', { pageTitle: 'Create Course' });
    })

    .post(function(req, res, next) {
      async.waterfall([
        function(callback) {
          Course.findOne({ code: req.body.code }, function(err, existingCourse) {
            if (course) {
              // Duplication of code.
            } else {
              var course = new Course();

              course.name = req.body.name;
              course.description = req.body.description;
              course.code = req.body.code;
              course.ownByTeacher = req.user._id;
              course.save(function(err, newCourse) {
                if (err) return next(err);

                callback(err, newCourse);
              });
            }
          });
        },
        function(newCourse, callback) {
          User.update(
              {
                _id: req.user._id,
                'courses.course': { $ne: newCourse._id }
              },
              {
                $push: { courses: { course: newCourse._id } },
              }, function(err, count) {
                if (err) return next(err);
                io.emit('course', newCourse);
                res.redirect('/teacher/mycourse');
            });
        },
      ])

    });

  app.get('/teacher/upload/:id', function(req, res, next) {
    Course.findOne({ _id: req.params.id }, function(err, course) {
      if (err) return next(err);
      console.log(req.params.id)
      res.render('teacher/upload', { pageTitle: 'Upload a file (lectures, videos..)',  course: course});
    });
  });

  app.route('/teacher/profile')

    .get(passportConf.requireRole('teacher'), function(req, res, next) {
      res.render('teacher/profile', { pageTitle: 'Profile' });
    })

    .post(function(req, res, next) {

    });

  /* GET --> For Edit profile */
  app.get('/teacher/profile', passportConf.requireRole('teacher'), function(req, res) {
    res.render('teacher/profile.ejs', { message: req.flash('success'), pageTitle: 'Profile' });
  });

  /* POST --> For edit data */
  app.post('/teacher/edit-profile', function(req, res) {
    Teacher.findOne({ _id: req.user._id }, function(err, user) {
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

  // app.get('/test/s3', function(req, res, next) {
  //   .getObject({ Bucket: this.awsBucketName, Key: 'test4.png' }, function(err, data) {
  //     if (!err)
  //     console.log(data.Body.toString());
  //   });
  // });

}
