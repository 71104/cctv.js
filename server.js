const serveStatic = require('serve-static')('static');
const app = require('http').Server(serveStatic);
const io = require('socket.io')(app);

app.listen(process.env.PORT || 8080, function () {
  console.info('CCTV server listening on port ' + app.address().port);
});
