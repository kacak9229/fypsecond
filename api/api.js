var fs = require('fs');
var async = require('async');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./awsconfig.json');

var s3Bucket = new AWS.S3();


var passportConf = require('../passport');
var Course = require('../models/course');
var Certificate = require('../models/certificate');
var User = require('../models/user');

module.exports = function(app, s3fsImpl) {

  app.post('/api/teacher/upload/tos3', passportConf.requireRole('teacher'), function(req, res, next) {
    // exports.upload = function (req, res) {
    var file = req.files.file;
    var stream = fs.createReadStream(file.path);
    return s3fsImpl.writeFile(file.originalFilename, stream).then(function () {
      fs.unlink(file.path, function (err, cs) {
        if (err) {
          console.error(err);
        } else {
          async.waterfall([
            function(callback) {
              var urlParams = {Bucket: 'naufals3nodejsbucket', Key: file.name, Expires: 604800};
              s3Bucket.getSignedUrl('getObject', urlParams, function(err, url){
                console.log('the url of the image is', url);
                callback(err, url);
              });
            },
            function(url, callback) {
              Course.update(
                {
                  _id: req.body.courseId,
                  'files.fileUrl': { $ne: url }
                },
                {
                  $push: { files: { fileUrl: url, name: file.name } },

                }, {
                  multi: true
                },function(err, count) {
                  if (err) return next(err);
                  console.log('Successfully saved');

                });

              },
            ]);
          }
        });

        res.status(200).end();
      });
    });

    app.post('/api/give-certificate', passportConf.requireRole('teacher'), function(req, res, next) {
      async.waterfall([
        function(callback) {
          Certificate.findOne({ _id: req.body.userId}, function(err, user) {
            if (user) {
              res.json('Found user');
            } else {
              var userId = req.body.userId;
              var cert = new Certificate();
              cert.ownBy = userId;
              cert.course = req.body.courseId;
              cert.save(function(err, cert) {
                callback(err, userId);
              });
            }
          });
        },
        function(userId, callback) {
          User.findOne({ _id: userId }, function(err, foundUser) {
            if (foundUser) {
              res.json("Successfully gave certificate to " + foundUser.profile.name);
            }
          });
        }
      ]);
    });

  }
