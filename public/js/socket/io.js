$(function() {

  var socket = io();

  var typing = false;
  var timeout;



  socket.on('course', function(data) {
    if (data) {
      var html = '';
      html += '<div class="card"> <div class="header"><h4 class="title">' + data.name + '</h4></div>';
      html += '<div class="content"><p class="category">' + data.description + '</p>'
      html += '<br />'
      html += '<a href= "/student/courses/' + data._id + '" class="btn btn-primary">Details</a>'
      html += '</div>'
      html += '</div>'
      $('#course').append(html);
    }
  });


  function chatTo(message, targetedUser) {
    socket.emit('chatTo', { message: message, targetedUser });
  }

  var userId = $('#userId').val();

  $('#sendMessage').submit(function(){
    var input = $('#message').val();
    var targetedUser = $('#targetedUser').val();
    if (input === '') {
      return false;
    } else {
      chatTo(input, targetedUser);
      $('#message').val('');
      return false;
    }

  });


  // Custom Message
  socket.on('incomingChat', function(data) {
    var username = $('#username').val();
    var html = '';
    if (data.sender === username) {
      html += '<div class="message right">';
      html += '<span class="pic"><img src="' + data.picture + '" alt="user"></span>';
      html += '<div class="bubble right">';
      html += '<p>' + data.message + '</p>';
      html += '<small class="time">12:03<i class="material-icons sent">done_all</i></small>';
      html += '</div></div>';

    } else {
      html += '<div class="message left">';
      html += '<span class="pic"><img src="' + data.picture + '" alt="user"></span>';
      html += '<div class="bubble left">';
      html += '<p>' + data.message + '</p>';
      html += '<small class="time">12:03<i class="material-icons sent">done_all</i></small>';
      html += '</div></div>';

    }

    $('.chat-msgs').append(html);
    $('#chatMsgs').scrollTop($('#chatMsgs')[0].scrollHeight);


  })


});
