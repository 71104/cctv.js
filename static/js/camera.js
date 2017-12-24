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
    socket.on('call', function (index, sdp) {
      const pc = new RTCPeerConnection();
      var localDescription;
      pc.setRemoteDescription(sdp).then(function () {
        return pc.createAnswer();
      }).then(function (sdp) {
        localDescription = sdp;
        return pc.setLocalDescription(sdp);
      }).then(function () {
        socket.emit('call', index, localDescription);
      }).catch(function (error) {
        console.error(error);
      });
    }).emit('camera');
    video.prop('srcObject', stream);
  }).catch(function (error) {
    console.error(error);
  });
});
