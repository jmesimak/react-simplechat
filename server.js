var express = require('express');
var path = require('path');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, 'public')));

//app.listen(3000);

app.get('/', function (req, res) {
  res.send('Hello');
});

http.listen(3000, 'localhost');

var users = [];
var activeChats = [];

io.on('connection', function(socket) {
  console.log('client connected');

  socket.on('login', function(user) {
    console.log('logged in!');
    users.push(user);
    io.emit('newuser', user);
  });

  socket.on('msg', function(data) {
    console.log(data);
    io.emit('msg', data);
  });

  socket.on('disconnect', function() {
    console.log('disco');
  });

  // {participants: [user1, user2]}
  socket.on('newchat', function(chatParams) {
    var newChat = {};
    newChat.participants = chatParams.participants;
    activeChats.push(newChat);
  });

});
