$(function () {
  const video = $('video#video');

  $(window).resize(function () {
    video.attr({
      width: $(window).width(),
      height: $(window).height(),
    });
  });

  const socket = io.connect();

  const Call = function (stream, index, offer) {
    this._accept(stream, index, offer);
  };

  Call.prototype._accept = async function (stream, index, offer) {
    this._connection = new RTCPeerConnection({
      iceServers: [{
        url: 'stun:stun.l.google.com:19302',
      }]
    });
    this._connection.onicecandidate = function (event) {
      socket.emit('ice candidate', index, event.candidate.candidate);
    };
    this._connection.addStream(stream);
    try {
      await this._connection.setRemoteDescription(offer);
      const answer = await this._connection.createAnswer();
      await this._connection.setLocalDescription(answer);
      socket.emit('call', index, answer);
    } catch (error) {
      console.error(error);
    }
  };

  Call.prototype.addIceCandidate = function (candidate) {
    this._connection.addIceCandidate(candidate);
  };

  const calls = Object.create(null);

  const listen = function (stream) {
    socket.on('call', function (index, offer) {
      calls[index] = new Call(stream, index, offer);
    }).on('ice candidate', function (index, candidate) {
      const call = calls[index];
      if (call) {
        call.addIceCandidate(candidate);
      }
    }).on('call error', function (index) {
      console.error(`central ${index + 1} has left`);
    }).emit('camera');
  };

  const start = async function () {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
      video.prop('srcObject', stream);
      listen(stream);
    } catch (error) {
      console.error(error);
    }
  };

  start();
});
