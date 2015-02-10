"use strict";

var TweenArgsCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    console.log($scope.modalTweenData);
    $scope.modalTweenData.tmp = new Object();
    $scope.modalTweenData.tmp.tween = new Object();
    $scope.modalTweenData.tmp.tween.name = $scope.modalTweenData.tween.name;
    
    //clone the data in order to being able to revert future changes
    var props = new Object();
    try {
      props = JSON.parse($scope.modalTweenData.tween.properties);
    } catch(e) {
    }
    $scope.modalTweenData.tmp.tween.properties = props;

  };

  $scope.save = function () {
    var props = new Object();
    try {
      props = JSON.stringify($scope.modalTweenData.tmp.tween.properties);
      
      $scope.modalTweenData.tween.properties = props;
    } catch(e) {
    }

    $modalInstance.close($scope.modalTweenData.tween);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  $scope.deleteArg = function (_argName) {
    if( $scope.modalTweenData.tmp.tween.properties.hasOwnProperty(_argName)){
      delete $scope.modalTweenData.tmp.tween.properties[_argName];
    }
  };

  $scope.addArg = function () {
    if($scope.modalTweenData.newName != null
      && $scope.modalTweenData.newName != "")
    {
      var jsonValue = $scope.modalTweenData.newValue;
      try {
        jsonValue = JSON.parse($scope.modalTweenData.newValue);
      } catch(e) {
      }

      var elementName = $scope.modalTweenData.newName;
      var properties = $scope.modalTweenData.tmp.tween.properties;
      
      properties[elementName] = jsonValue;
      
      $scope.modalTweenData.newName = null;
      $scope.modalTweenData.newValue = null;
    }
  };

  main();
};