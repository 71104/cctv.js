const serveStatic = require('serve-static')('static');
const app = require('http').Server(serveStatic);
const io = require('socket.io')(app);

const centrals = [];
const cameras = [];

function sendCameraList(socket) {
  socket.emit('list', cameras.filter(function (camera) {
    return !!camera;
  }).map(function (camera, index) {
    return index;
  }));
}

function broadcastCameraList() {
  centrals.forEach(function (central) {
    sendCameraList(central);
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
    console.log('new camera');
    handleCamera(socket);
  });
});

app.listen(process.env.PORT || 8080, function () {
  console.info('CCTV server listening on port ' + app.address().port);
});
