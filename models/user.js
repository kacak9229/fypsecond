var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true},
  socketId: String,
  online: String,
  password: String,
  facebook: String,
  tokens: Array,
  profile: {
    firstname: { type: String, default: ''},
    lastname: { type: String, default: ''},
    name: { type: String, default: ''},
    picture: { type: String, default: ''}
  },
  role: { type: String, lowercase: true },
  class: String,
  courses: [{
    course: { type: Schema.Types.ObjectId, ref: 'Course'},
  }],

});

UserSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.gravatar = function(size) {
  if (!size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

module.exports = mongoose.model('User', UserSchema);
