var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var gameModule = require('./public/js/game.js');
//var game = new gameModule.Game();
//game.start();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static(__dirname + '/public'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var playersNum = 0;
var gameStarted = false;

io.on('connection', function(socket){
  console.log('a user connected ' + socket.id);
  if(playersNum < 2){
    playersNum++;
    socket.playerNum = playersNum;

    if(playersNum < 2){
      socket.emit('waiting');
    } else {
      io.emit('start');
      gameStarted = true;
    }
  }

  socket.on('disconnect', function(){
    if(gameStarted === false){
        playersNum--;
    }
    
    console.log('user disconnected ' + this.id);
    if(socket.playerNum == 1 || socket.playerNum == 2){
      io.emit('user left');
    }
  });
});
