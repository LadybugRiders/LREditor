"use strict";

var SettingsCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {

  };

  $scope.save = function () {
    if( $scope.modalSettingsData != null ){
      //parse to int
      $scope.modalSettingsData.camera.x = parseInt($scope.modalSettingsData.camera.x);
      $scope.modalSettingsData.camera.y = parseInt($scope.modalSettingsData.camera.y);
      $scope.modalSettingsData.camera.width = parseInt($scope.modalSettingsData.camera.width);
      $scope.modalSettingsData.camera.height = parseInt($scope.modalSettingsData.camera.height);

    	$scope.$emit("saveSettingsEmit",$scope.modalSettingsData);
    }
    $modalInstance.close($scope.modalSettingsData);
  };

  $scope.close = function () {
    console.log("close");
    $scope.modalSettingsData = jQuery.extend(true, {}, $scope.modalSettingsSave);
    $modalInstance.dismiss();
  };

  main();
};