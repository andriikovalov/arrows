$( document ).ready(function() {
    var socket = io();
    
    var game = new Game();
    currentPlayer = 0;
    
    var scene = new Scene(game, function(x, y, direction){
        console.log('send arrow ' + x + ' ' + y + ' ' + direction);
        socket.emit('arrow', x, y, direction);
    });
    scene.animate();

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

    socket.on('arrow', function(x, y, direction){
        console.log('receive arrow ' + x + ' ' + y + ' ' + direction);
        if (game.arrows[x][y].direction !== direction) {
            game.changeArrowDirection(x, y, direction);
        }
    });
    
});

function setStatus(statusText){
    $('#status').text(statusText);
}

