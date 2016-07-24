$( document ).ready(function() {
    var socket = io();
    
    var game = new Game();
    
    var scene = new Scene(game);
    scene.animate();

    socket.on('waiting', function(msg){
        setStatus('Waiting for a second player to join');
    });
    socket.on('start', function(msg){
        setStatus('Start!');
        game.start();
    });
    socket.on('user left', function(msg){
        setStatus('The other player left the game');
        game.stop();
        scene.stop();
    });
});

function setStatus(statusText){
    $('#status').text(statusText);
}