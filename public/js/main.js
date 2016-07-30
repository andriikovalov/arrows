$( document ).ready(function() {
    var game = new Game();
    currentPlayer = 0;

    var scene = new Scene(game);
    scene.animate();

    var socket = io();

    var unsafeTimeToUseclientPrediction = 0.8;

    Scene.notifyArrowChanged = function(x, y, direction){
        if(game.getStepTime() > unsafeTimeToUseclientPrediction){
            console.log('slow');
            socket.emit('arrow', x, y, direction, {sender:game.getGameTime()});
        } else {
            if(game.setArrow(currentPlayer, x, y, direction)){
                console.log('fast');
                socket.emit('arrow', x, y, direction, {sender:game.getGameTime()});
            }
        }
    };

    socket.on('waiting', function(){
        setStatus('Waiting for a second player to join');
    });
    socket.on('start', function(playerNumber){
        setStatus('Start!');
        currentPlayer = playerNumber;
        game.start();
    });
    socket.on('user left', function(){
        setStatus('The other player left the game');
        game.stop();
        scene.stop();
    });

    socket.on('arrow', function(x, y, direction, timeInfo){
        timeInfo.receiver = game.getGameTime();
        console.log('receive arrow ' + x + ' ' + y + ' ' + direction + ' to server: ' + (timeInfo.server - timeInfo.sender) + ' to receiver: ' + (timeInfo.receiver - timeInfo.server));
        if(Math.floor(timeInfo.sender) !== Math.floor(timeInfo.server)){
            console.log("DESYNC SERVER");
        }
        if(Math.floor(timeInfo.receiver) !== Math.floor(timeInfo.server)){
            console.log("DESYNC RECEIVER");
        }

        if(Math.floor(timeInfo.receiver) < Math.floor(timeInfo.server)){
            console.log("schedule change");
            game.changeArrowDirectionNextTurn(x, y, direction);
        }

        if (game.arrows[x][y].direction !== direction) {
            game.changeArrowDirection(x, y, direction);
        }
    });
    
});

function setStatus(statusText){
    $('#status').text(statusText);
}
