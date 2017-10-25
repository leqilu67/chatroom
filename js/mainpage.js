$(function(){
  var socket = io();
  var user;
  var connected = false;
  var typing = false;
  var timeout;

  $('form#signin').submit(function(){
    socket.emit('setUsername', $('#username').val());
    return false;
  });

  socket.on('takenUsername', function(username){
    $('#verification').html(username + ' is taken. Please choose another username.');
  });

  socket.on('invalid', function(username){
    $('#verification').html('"' + username + '" is not a valid username. Please choose another username.');
  });

  socket.on('allowChat', function(username){
    $('form').remove('#signin');
    $('#verification').remove();
    var e = '<li>Welcome, <b>' + username + '</b>!';
    $('#messages').append(e);
    $('#m').prop( 'disabled', false );
    $('#sendBtn').prop( 'disabled', false );
    $('#messages').css('visibility', 'visible');
    $('#bottomDivs').css('visibility', 'visible');
    $('p').css('color', 'gray');
    user = username;
    connected = true;
  });

  $('form#messageDiv').submit(function(){
    //submit message to server
    socket.emit('chat message', {msg: $('#m').val(), username: user});
    //reset message box
    $('#m').val('');
    //reset timeout, remove typing notification
    clearTimeout(timeout);
    timeoutFunction();
    return false;
  });

  $('#disconnectBtn').click(function(){
    console.log(user);
    socket.emit('manualDisconnect', {username: user});
    // socket.disconnect({username: user});
    socket.emit('disconnect', {username: user});
    socket.disconnect({username: user});
    var e = "<li>You have disconneted.";
    $('#messages').append(e);
  });

  socket.on('chat message', function(data){
    if (!connected) return;
    var e = '<li><b>' + data.username + '</b>: ' + data.msg;
    $('#messages').append(e);
  });

  socket.on('clientConnect', function(username){
    if (!connected) return;
    socket.emit('join', username);
    var e = '<li><b>' + username + '</b> is online!';
    $('#messages').append(e);
  });

  socket.on('clientDisconnected', function(username){
    if (!connected) return;
    var e = '<li><b>' + username + '</b> has disconnected.';
    $('#messages').append(e);
  });

  function timeoutFunction(){
    typing = false;
    socket.emit('typingMessages', {username: user, typing: false});
  }

  $('#m').keyup(function(e){
    if (e.which != 13){
      typing = true;
      socket.emit('typingMessages', {username: user, typing: true});
      clearTimeout(timeout);
      timeout = setTimeout(timeoutFunction, 2000);
    } else {
      clearTimeout(timeout);
      timeoutFunction();
    }
  });

  socket.on('userTyping', function(data){
    if (data.typing){
      $('#typingNotification').html(data.username + ' is typing');
    } else {
      $('#typingNotification').html('');
    }
  });

});
