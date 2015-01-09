"use strict";

var BehaviourArgsCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    $scope.modalParamsData.tmp = new Object();
    $scope.modalParamsData.tmp.behaviour = new Object();
    $scope.modalParamsData.tmp.behaviour.name = $scope.modalParamsData.behaviour.name;
    
    //clone the data in order to being able to revert future changes
    var clone = new Object();
    try {
      clone = JSON.parse(JSON.stringify($scope.modalParamsData.behaviour.params));
    } catch(e) {
    }
    $scope.modalParamsData.tmp.behaviour.params = clone;

    //find gameobjects referenced in the params
    $scope.buildGameObjectReferences();
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
    var currentPick = null;
    //check if a gameobject is already picked
    var idString = $scope.modalParamsData.tmp.behaviour.params[_argName];
    if( $scope.goHash[idString] != null)
      currentPick = $scope.goHash[idString].entity;
    
    $scope.$emit("pickEntityEmit",{context:this, callback : this.onGameObjectPicked, currentPick : currentPick});
  }

  $scope.onGameObjectPicked = function(_entity){
    if( _entity && $scope.currentArg ){
      var idString = "#GO_"+_entity.go.id;
      $scope.modalParamsData.tmp.behaviour.params[$scope.currentArg] = idString;
      $scope.addGameObject(idString);
    }
  }

  $scope.isGameObjectReference = function(_value){
    if(typeof _value == "string" && _value.indexOf("#GO_") >=0){
      return true;
    }
    return false;
  }

  $scope.buildGameObjectReferences = function(){
    $scope.goHash = {};
    var params = $scope.modalParamsData.tmp.behaviour.params;
    for(var key in params){
      var value = params[key];
      if( $scope.isGameObjectReference(value) ){
        $scope.addGameObject(value);
      }
    }
  }

  $scope.addGameObject = function(_idString){
      var id = parseInt(_idString.substring(4));
      var go = LR.GameObject.FindByID($scope.modalParamsData.game.world, id);
      if( go ){
        $scope.goHash[_idString] = go;
      }
  }

  $scope.getGameObjectNameByID = function(_id){
    if( $scope.goHash[_id] != null)
      return $scope.goHash[_id].name + " [ID:" + $scope.goHash[_id].id + "]";
    return "undefined";
  }

  main();
};