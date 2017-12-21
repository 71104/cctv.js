$(function () {
  const video = $('video#video');

  $(window).resize(function () {
    video.attr({
      width: $(window).width(),
      height: $(window).height(),
    });
  });

  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  }).then(function (stream) {
    const socket = io.connect();
    socket.emit('camera').on('call', function (index, sdp) {
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(sdp);
      pc.createAnswer().then(function (sdp) {
        return pc.setLocalDescription(sdp);
      }).then(function () {
        socket.emit('call', index, sdp);
      }).catch(function (error) {
        console.error(error);
      });
    });
    video.prop('srcObject', stream);
  }).catch(function (error) {
    console.error(error);
  });
});
