function doCall(index, socket) {
  const pc = new RTCPeerConnection();

  socket.on('call', function (index, sdp) {
    pc.setRemoteDescription(sdp).catch(function (error) {
      console.error(error);
    });
  }).emit('central');

  pc.createOffer().then(function (sdp) {
    pc.setLocalDescription(sdp);
    socket.emit('call', index, sdp);
  }).catch(function (error) {
    console.error(error);
  });
}

$(function () {
  const urlParams = Object.create(null);
  window.location.search.replace(/^\?/, '').split('&').map(function (pair) {
    return pair.split(/=/).map(decodeURIComponent);
  }).forEach(function (pair) {
    urlParams[pair[0]] = pair[1];
  });

  if ('index' in urlParams) {
    doCall(parseInt(urlParams.index, 10), io.connect());
  } else {
    window.location = '/';
  }
});
