"use strict";

var InputsCtrlModal = function ($scope, $modalInstance, $timeout) {
  
  function main() {
    $scope.modalInputsData.inputsText = "{}";
    if (typeof $scope.modalInputsData.inputs === "object") {
      $scope.modalInputsData.inputsText = JSON.stringify($scope.modalInputsData.inputs);
    }
  };

  $scope.save = function () {
    if ($scope.modalInputsData.inputsText != "") {
      try {
        $scope.modalInputsData.inputs = JSON.parse($scope.modalInputsData.inputsText);
      } catch(e) {
        $scope.modalInputsData.inputs = new Object();
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