"use strict";

var LevelImportCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    
  };

  $scope.import = function () {
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