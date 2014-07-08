"use strict";

var BehaviourArgsCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    $scope.modalParamsData.tmp = new Object();
    $scope.modalParamsData.tmp.behaviour = new Object();
    $scope.modalParamsData.tmp.behaviour.name = $scope.modalParamsData.behaviour.name;
    
    var clone = new Object();
    try {
      clone = JSON.parse(JSON.stringify($scope.modalParamsData.behaviour.params));
    } catch(e) {
    }
    $scope.modalParamsData.tmp.behaviour.params = clone;
  };

  $scope.save = function () {
    var clone = new Object();
    try {
      clone = JSON.parse(JSON.stringify($scope.modalParamsData.tmp.behaviour));
      
      $scope.modalParamsData.behaviour.params = clone.params;
    } catch(e) {
    }

    $modalInstance.close(clone);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  $scope.deleteArg = function (_argName) {
    if( $scope.modalParamsData.tmp.behaviour.params.hasOwnProperty(_argName)){
      delete $scope.modalParamsData.tmp.behaviour.params[_argName];
    }
  };

  $scope.addArg = function () {
    if($scope.modalParamsData.newName != null
      && $scope.modalParamsData.newName != "")
    {
      var jsonValue = $scope.modalParamsData.newValue;
      try {
        jsonValue = JSON.parse($scope.modalParamsData.newValue);
      } catch(e) {
      }

      var elementName = $scope.modalParamsData.newName;
      var params = $scope.modalParamsData.tmp.behaviour.params;
      
      params[elementName] = jsonValue;
      
      $scope.modalParamsData.newName = null;
      $scope.modalParamsData.newValue = null;
    }
  };

  $scope.pickEntity = function(_argName){  
    $scope.currentArg = _argName;
    $scope.$emit("pickEntityEmit",{context:this, callback : this.onGameObjectPicked});
  }

  $scope.onGameObjectPicked = function(_entity){
    console.log(_entity);
    if( _entity && $scope.currentArg ){
      $scope.modalParamsData.tmp.behaviour.params[$scope.currentArg] = "#GO_"+_entity.go.id;
    }
  }

  main();
};