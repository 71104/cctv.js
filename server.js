const path = require('path');

const serveStatic = require('serve-static');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(serveStatic(path.join(__dirname, 'static')));

const centrals = [];
const cameras = [];

function sendCameraList(socket) {
  socket.emit('list', cameras.map(function (camera, index) {
    return camera ? index : -1;
  }).filter(function (index) {
    return index >= 0;
  }));
}

function broadcastCameraList() {
  centrals.forEach(function (central) {
    if (central) {
      sendCameraList(central);
    }
  });
}

function handleCentral(socket) {
  const index = centrals.length;
  centrals.push(socket);
  socket.on('list', function () {
    sendCameraList(socket);
  }).on('call', function (index) {
    // TODO
  }).on('disconnect', function () {
    centrals[index] = null;
  });
}

function handleCamera(socket) {
  const index = cameras.length;
  cameras.push(socket);
  broadcastCameraList();
  socket.on('call', function () {
    // TODO
  }).on('disconnect', function () {
    cameras[index] = null;
    broadcastCameraList();
  });
}

io.on('connection', function (socket) {
  socket.on('central', function (password) {
    if (password !== process.env.PASSWORD) {
      socket.emit('central password error');
    } else {
      handleCentral(socket);
    }
  }).on('camera', function () {
    handleCamera(socket);
  });
});

http.listen(process.env.PORT || 8080, function () {
  console.info('CCTV server listening on port ' + http.address().port);
});
