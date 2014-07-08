"use strict";

var PickEntityCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {

  };

  $scope.onSelect = function(_entity){
    if( _entity.go == null)
      return;
    $scope.pickedEntity = _entity;
  }

  $scope.pick = function () {
    $modalInstance.close($scope.pickedEntity);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  main();
};