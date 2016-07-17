var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var CourseSchema = new Schema({

  name: String,
  description: String,
  code: { type: String, unique: true },
  files: [{
    fileUrl: String,
    name: { type: String, default: "Filename" }
  }],
  ownByTeacher: { type: Schema.Types.ObjectId, ref: 'User'},
  ownByStudent: [{
    user: { type: Schema.Types.ObjectId, ref: 'User'},
  }],
  totalStudents: Number

});

module.exports = mongoose.model('Course', CourseSchema);
