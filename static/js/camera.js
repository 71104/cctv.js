$(function () {
  const video = $('video#video');

  $(window).resize(function () {
    video.attr({
      width: $(window).width(),
      height: $(window).height(),
    });
  });

  const accept = async function (stream, socket, index, offer) {
    const pc = new RTCPeerConnection();
    pc.addStream(stream);
    try {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('call', index, answer);
    } catch (error) {
      console.error(error);
    }
  };

  const listen = function (stream) {
    const socket = io.connect();
    socket.on('call', function (index, offer) {
      accept(stream, socket, index, offer);
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
