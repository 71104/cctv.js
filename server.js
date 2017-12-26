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
  const send = function (cameraIndex, name, data) {
    const camera = cameras[cameraIndex];
    if (camera) {
      camera.emit(name, index, data);
    } else {
      socket.emit('call error', cameraIndex);
    }
  };
  socket.on('list', function () {
    sendCameraList(socket);
  }).on('call', function (cameraIndex, sdp) {
    send(cameraIndex, 'call', sdp);
  }).on('ice candidate', function (cameraIndex, candidate) {
    send(cameraIndex, 'ice candidate', candidate);
  }).on('disconnect', function () {
    centrals[index] = null;
  });
}

function handleCamera(socket) {
  const index = cameras.length;
  cameras.push(socket);
  broadcastCameraList();
  const send = function (centralIndex, name, data) {
    const central = centrals[centralIndex];
    if (central) {
      central.emit(name, index, data);
    } else {
      socket.emit('call error', centralIndex);
    }
  };
  socket.on('call', function (centralIndex, sdp) {
    send(centralIndex, 'call', sdp);
  }).on('ice candidate', function (centralIndex, candidate) {
    send(centralIndex, 'ice candidate', candidate);
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
