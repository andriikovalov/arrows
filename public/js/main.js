$( document ).ready(function() {
    var socket = io();

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