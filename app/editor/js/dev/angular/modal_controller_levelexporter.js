"use strict";

var LevelExportCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    
  };

  $scope.export = function () {
    var data = {
      levelName: $scope.modalData.levelName,
      levelPath: $scope.modalData.levelPath,
      levelStorage: "file"
    };
    $modalInstance.close(data);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  main();
};