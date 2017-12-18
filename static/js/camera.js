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
    io.connect().emit('camera');
    video.prop('srcObject', stream);
  }).catch(function (error) {
    console.error(error);
  });
});
