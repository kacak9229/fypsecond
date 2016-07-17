var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CertificateSchema = new Schema({
  ownBy: { type: Schema.Types.ObjectId, ref: 'User'},
  course: { type: Schema.Types.ObjectId, ref: 'Course'},
});

module.exports = mongoose.model('Certificate', CertificateSchema);
