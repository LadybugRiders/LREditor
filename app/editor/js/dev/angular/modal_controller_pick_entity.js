"use strict";

var PickEntityCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
  };

  $scope.onSelect = function(_entity){
    if( _entity.go == null)
      return;
    $scope.modalPickData.pickedEntity = _entity;
  }

  $scope.pick = function () {
    $modalInstance.close($scope.modalPickData.pickedEntity);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  main();
};