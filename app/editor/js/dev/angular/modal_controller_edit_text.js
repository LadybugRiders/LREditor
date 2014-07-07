"use strict";

var EditTextCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    
  };

  $scope.edit = function () {
    if($scope.modalEditData.context != null) {
      $scope.modalEditData.context[$scope.modalEditData.varName] = $scope.modalEditData.edit_text;
    }
    
    $modalInstance.close($scope.modalEditData);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  main();
};