var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// serve static files
app.use('/css', express.static(path.join(__dirname + '/css')));

var clientCount = 0;
var allClients = [];
var usernames = [];
var people = {};

io.on('connection', function(socket){
  socket.on('setUsername', function(username){
    if (username.trim() == "") {
      socket.emit('invalid', username);
    } else if (usernames.indexOf(username) == -1) {
      allClients.push(socket);
      usernames.push(username);
      socket.emit('allowChat', username);
      socket.broadcast.emit('clientConnect', username);
    } else {
      socket.emit('takenUsername', username);
    }
  });

  socket.on('join', function(username){
    people[socket.id] = {'username': username};
    // socket.username = username;
    // console.log(socket.id, socket.username);
  });

  clientCount++;

  // sending to all clients except the sender
  // socket.broadcast.emit('clientConnected', {description: "A new user has connected."});
  // sending to sender only
  // socket.emit('clientConnected', {description: "Welcome! You are client #" + clientCount});

  socket.on('manualDisconnect', function(data){
    console.log('manualDisconnect, username is ' + data.username);
    socket.broadcast.emit('clientDisconnected', data.username);
  });

  socket.on('disconnect', ()=> {
    console.log('what is going on');
  });

  // socket.on('disconnect', function(data){
  //   clientCount--;
  //   // sending to all clients
  //   var username = people[socket.id];
  //   console.log('111111 ', username);
  //   console.log(data);
  //   // socket.broadcast.emit('clientDisconnected', data.username);
  // });

  socket.on('chat message', function(data){
    io.emit('chat message', data);
  });

  socket.on('typingMessages', function(data){
    socket.broadcast.emit('userTyping', data);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
