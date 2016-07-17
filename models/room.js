var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RoomSchema = new Schema({
  users: [{
    type: Schema.Types.ObjectId, ref: 'User',
  }],
  messages: [{
    message: { type: String },
    creator: { type: Schema.Types.ObjectId, ref:'User'},
    date: { type: Date },
  }]
});

// Room Schema logic
module.exports = mongoose.model('Room', RoomSchema);
