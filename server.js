const path = require('path');

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const auth = require('http-auth');
app.use(auth.connect(auth.digest({
  realm: 'CCTV',
  file: path.join(__dirname, '.htdigest'),
})));

const serveStatic = require('serve-static');
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
  }).on('call', function (cameraIndex, sdp) {
    const camera = cameras[cameraIndex];
    if (camera) {
      camera.emit('call', index, sdp);
    } else {
      socket.emit('call error', index);
    }
  }).on('disconnect', function () {
    centrals[index] = null;
  });
}

function handleCamera(socket) {
  const index = cameras.length;
  cameras.push(socket);
  broadcastCameraList();
  socket.on('call', function (centralIndex, sdp) {
    const central = centrals[centralIndex];
    if (central) {
      central.emit('call', index, sdp);
    } else {
      socket.emit('call error', centralIndex);
    }
  }).on('disconnect', function () {
    cameras[index] = null;
    broadcastCameraList();
  });
}

io.on('connection', function (socket) {
  socket.on('central', function () {
    handleCentral(socket);
  }).on('camera', function () {
    handleCamera(socket);
  });
});

http.listen(process.env.PORT || 8080, function () {
  console.info('CCTV server listening on port ' + http.address().port);
});
