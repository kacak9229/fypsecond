$(function() {

  // $(document).on('click', "button", function(e){

  //   e.preventDefault();
  //   var room = 'addRooms';
  //   var userId = $('#userId').val();
  //   var socketId = $('#socketId').val();
  //   $('#addFriend').removeClass('btn-default').addClass('btn-success')
  //   .html('<span class="glyphicon glyphicon-ok"></span> Added').attr('id', 'addFriend');
  //   $('#addFriend').prop('disabled', true);
  //   socket.emit('friendsRequest', {
  //     userId: userId,
  //   });
  // });

  $(".buttonClass").click(function(e){
    console.log(e.target.id);
    var courseId = $('#courseId').val();
    $.ajax({
      type: "POST",
      url: "/api/give-certificate/",
      data:{
        userId: e.target.id,
        courseId: courseId
      },
      success: function(data){
        alert(data);
      },
      error: function(data){
        // Do something later
      }
    });

  });



});
