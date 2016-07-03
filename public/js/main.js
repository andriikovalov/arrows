$( document ).ready(function() {
    var socket = io();
    
    var game = new Game();
    game.start();
    
    var scene = new Scene();
    scene.animate();

    socket.on('waiting', function(msg){
        setStatus('waiting');
    });
    socket.on('start', function(msg){
        setStatus('start');
    });
});

function setStatus(statusText){
    $('#status').text(statusText);
}