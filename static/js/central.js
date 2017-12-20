function CameraController($scope) {
  $scope.cameras = [];

  const socket = io.connect();

  socket.on('list', function (cameras) {
    $scope.$apply(function () {
      $scope.cameras = cameras;
    });
  }).emit('central', 'test').emit('list');
}


angular
  .module('Central', ['ui.bootstrap'])
  .controller('CameraController', CameraController);
