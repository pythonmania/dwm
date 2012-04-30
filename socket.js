var mongo = require('./mongodb');

exports.listen = function(app) {
  var io = require('socket.io').listen(app, {
    log : false
  });

  io.sockets.on('connection', function(socket) {
    socket.on('connect', function(data) {
      console.log("client " + data.uid + " connected : " + socket.id);
    });
    socket.on('open', function(data) {
      this.broadcast.emit("join", {
        from : data.from,
        to : data.to
      });
    });
    socket.on('message', function(data) {
      mongo.insertChatlog(data.from, data.to, data.message);
      this.broadcast.emit("message", data.message);
    });
  });
}
