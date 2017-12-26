$(function () {
  const ready = async function (pc, index, answer) {
    try {
      await pc.setRemoteDescription(answer);
    } catch (error) {
      console.error(error);
    }
  };

  const call = async function (index, socket) {
    const pc = new RTCPeerConnection();
    pc.onaddstream = function (event) {
      $('video#video').prop('srcObject', event.streams[0]);
    };

    socket.on('call', function (index, answer) {
      ready(pc, index, answer);
    }).emit('central');

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('call', index, offer);
    } catch (error) {
      console.error(error);
    }
  };

  const urlParams = Object.create(null);
  window.location.search.replace(/^\?/, '').split('&').map(function (pair) {
    return pair.split(/=/).map(decodeURIComponent);
  }).forEach(function (pair) {
    urlParams[pair[0]] = pair[1];
  });

  if ('index' in urlParams) {
    const index = parseInt(urlParams.index, 10);
    const socket = io.connect();
    call(index, socket);
  } else {
    window.location = '/';
  }
});
