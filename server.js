var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var gameModule = require('./public/js/game.js');
var game = new gameModule.Game();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static(__dirname + '/public'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var playersNum = 0;
var gameStarted = false;
var players1Socket;
var players2Socket;

io.on('connection', function(socket){
  console.log('a user connected ' + socket.id);
  if(playersNum === 0){
    playersNum++;
    socket.playerNum = 1;
    players1Socket = socket;

    socket.emit('waiting');
  } else if(playersNum === 1) {
      playersNum++;
      socket.playerNum = 2;
      players2Socket = socket;
      players1Socket.emit('start', 1);
      players2Socket.emit('start', 2);
      gameStarted = true;
      game.start();
      console.log('Game Start!');
  }

  socket.on('disconnect', function(){
    console.log('user disconnected ' + this.id);

    if(socket.playerNum === 1 || socket.playerNum === 2){
        if(gameStarted === false){
            playersNum--;
            if(socket.playerNum === 1 && typeof players2Socket !== 'undefined'){
                players2Socket.playerNum = 1;
                players1Socket = players2Socket;
            }
        }
        else {
            io.emit('user left');
            gameStarted = false;
            playersNum = 0;
            players1Socket.playerNum = 0;
            players2Socket.playerNum = 0;
            game.stop();
            game = new gameModule.Game();
        }
    }
  });

    socket.on('arrow', function(x, y, direction, timeInfo){
        console.log('arrow ' + socket.playerNum + ' ' + x + ' ' + y + ' ' + direction + ' at ' + game.getGameTime());
        timeInfo.server = game.getGameTime();
        if(Math.floor(timeInfo.sender) > Math.floor(timeInfo.server)){
            console.log("client is ahead");
        }
        if (game.setArrow(socket.playerNum, x, y, direction)) {
            io.emit('arrow', x, y, direction, timeInfo);
        } else {
            console.log("FAIL");
        }
    });

});

var changeArrow = function(){};