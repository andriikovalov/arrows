$( document ).ready(function() {
    var socket = io();
    
    var game = new Game();
    game.start();

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