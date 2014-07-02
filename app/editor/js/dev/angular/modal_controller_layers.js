"use strict";

var LayersCtrlModal = function ($scope, $modalInstance, $timeout) {
  
  function main() {
    $scope.modalLayersData.layersText = "{}";
    if (typeof $scope.modalLayersData.layers === "object") {
      $scope.modalLayersData.layersText = JSON.stringify($scope.modalLayersData.layers);
    }
  };

  $scope.save = function () {
    if ($scope.modalLayersData.layersText != "") {
      try {
        $scope.modalLayersData.layers = JSON.parse($scope.modalLayersData.layersText);
      } catch(e) {
        $scope.modalLayersData.layers = new Object();
        console.error(e);
      }
    }

    $modalInstance.close(null);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  main();
};