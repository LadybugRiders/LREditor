"use strict";

var BehaviourArgsCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    
  };

  $scope.save = function () {
    //Parse string values to obtain a correct JSON object
    var tempArgs = $scope.modalArgsData.args;
    for(var key in $scope.modalArgsData.args ){
      tempArgs[key] = jQuery.parseJSON($scope.modalArgsData.args[key]);
    }
    //Reconvert the JSON object back to a string 
    $scope.modalArgsData.behaviour.args = JSON.stringify(tempArgs);

    $modalInstance.close($scope.modalArgsData);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  $scope.deleteArg = function (_argName) {
    if( $scope.modalArgsData.args.hasOwnProperty(_argName)){
      delete $scope.modalArgsData.args[_argName];
    }
  };

  $scope.addArg = function () {
      if( $scope.modalArgsData.newName != null && $scope.modalArgsData.newName != "" ){
        $scope.modalArgsData.args[$scope.modalArgsData.newName] = $scope.modalArgsData.newValue;
        $scope.modalArgsData.newName = null;
        $scope.modalArgsData.newValue = null;
      }
  };

  main();
};