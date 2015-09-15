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

io.on('connection', function(socket) {
  console.log('client connected');
  socket.on('msg', function(data) {
    console.log(data);
    io.emit('msg', data);
  });
});
