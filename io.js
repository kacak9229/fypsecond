var async = require('async');
var User = require('./models/user');
var Room = require('./models/room');

module.exports = function(io) {

  io.on('connection', function(socket) {
    console.log("Client Connected");
    var user = socket.request.user;

    User.findOne({ _id: user._id }, function(err, foundUser) {
      if (foundUser) {
        foundUser.socketId = socket.id;
        foundUser.online = "Online";
        foundUser.save(function(err) {
          console.log(user.profile.name + " is " + foundUser.online);
        });
      }
    });

    socket.on('chatTo', function(data) {
      async.parallel([
        function(callback) {
          User.findOne({_id: data.targetedUser}, function(err, foundUser) {
            // Send to other user, by searching his/her specific socket
            io.to(foundUser.socketId).emit('incomingChat', {
              sender: user.profile.name, message: data.message, picture: user.profile.picture
            });
            // Sending to himself
            socket.emit('incomingChat', {
              sender: user.profile.name, message: data.message, picture: user.profile.picture
            });
            callback(err);
          })
        },

        function(callback) {
          Room.findOne(
            { "users": { "$all": [ user._id, data.targetedUser ] }}
            , function (err, foundRoom) {
              console.log("Room already exist");
              if (foundRoom) {
                foundRoom.messages.push({
                  message: data.message,
                  creator: user._id,
                  date: new Date(),
                })
                foundRoom.save(function(err) {
                  callback(err);
                });
              } else {

                var room = new Room();
                room.users.push(user._id, data.targetedUser);
                room.messages.push({
                  message: data.message,
                  creator: user._id,
                  date: new Date(),
                });
                room.save(function(err) {
                  if (err) return next(err);
                  console.log('Room Created');
                  callback(err);
                });
              }
            });
          }
        ]);
      });



      socket.on('disconnect', function() {
        console.log("Client Disconnected");
      });

    });



  }
