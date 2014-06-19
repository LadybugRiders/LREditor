"use strict";

var CutsceneEditorCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
  };

  $scope.save = function () {
    if( $scope.modalCSData.state == "actions"){
      $scope.backToEvents();
    }

    $scope.$emit("saveCutscenesEmit", {"cutscenes":$scope.modalCSData.cutscenes});

    //this will overide the saved cutscenes
    $scope.setCutscenes($scope.modalCSData.cutscenes);

    $modalInstance.dismiss();
  };

  $scope.close = function () { 
    if( $scope.modalCSData.state == "actions"){
      $scope.backToEvents();
    }

    //this will go back to the saved cutscenes. The ones edited in the modal will be reverted
    $scope.setCutscenes($scope.cutscenesSave);

    $scope.modalCSData.state = "none";
    $modalInstance.dismiss();
  };


  //==========================================
  //            CUTSCENE
  //==========================================

  $scope.addCutscene = function(_name){
      if( _name == "" ||_name == null){
        return;
      }
      $scope.modalCSData.cutscenes.push(
        {
          name : _name,
          events : []
        }
      );
  }

  $scope.deleteCutscene = function(_cutscene){
    var indexSplice = 0;
    for(var i = 0; i < $scope.modalCSData.cutscenes.length ; i++){
      var curEvent = $scope.modalCSData.json.cutscenes[i];
      if( curEvent === _cutscene){
        indexSplice = i;
        break;
      }
    }
    $scope.modalCSData.cutscenes.splice(indexSplice,1);
  }

  $scope.editCutscene = function(_cutscene){
    $scope.modalCSData.currentCutscene = _cutscene;
    $scope.modalCSData.state = "events";
  }

  $scope.copyCutscene = function(_cutscene){
    this.stringScene = JSON.stringify(_cutscene);
    $scope.$emit("openEditModalEmit",{context : this, varName :"stringScene",isLong : true});
  }

  //==========================================
  //            EVENTS
  //==========================================

  $scope.addEvent = function(_eventName){
      if( _eventName == "" ||_eventName == null){
        return;
      }
      $scope.modalCSData.currentCutscene.events.push(
        {
          name : _eventName,
          actions : []
        }
      );
  }

  $scope.deleteEvent = function(_event){
    var indexSplice = 0;
    for(var i = 0; i < $scope.modalCSData.currentCutscene.events.length ; i++){
      var curEvent = $scope.modalCSData.currentCutscene.events[i];
      if( curEvent === _event){
        indexSplice = i;
        break;
      }
    }
    $scope.modalCSData.currentCutscene.events.splice(indexSplice,1);
  }

  $scope.editEvent = function(_event){
    //Stringify actions values. We need action.data object to be editable, so we need a string
    for( var j=0; j < _event.actions.length ; j++){
      var curAction = _event.actions[j];
      if( curAction.data)
        curAction.data = JSON.stringify( curAction.data);
    }

    $scope.modalCSData.currentEvent = _event;
    $scope.modalCSData.state = "actions";
  }

  $scope.moveEventUp = function(_index){
    if( _index == 0 ){
      return;
    }
    //switch positions
    var tempObject = $scope.modalCSData.currentCutscene.events[_index];
    $scope.modalCSData.currentCutscene.events[_index] = $scope.modalCSData.currentCutscene.events[_index - 1];
    $scope.modalCSData.currentCutscene.events[_index - 1] = tempObject;
  }

  //==========================================
  //            ACTIONS
  //==========================================

  $scope.addAction = function(_actionType){
    if( _actionType == null)
        return;

    var jsonAction = { type : _actionType };
    switch(_actionType){
      case "tween" : jsonAction.data = "{ \"properties\" : { },\"delay\" : 0, \"duration\": 3, \"repeat\":0, \"yoyo\": false }"; 
        break;
      case "set" : jsonAction.data = "{ \"properties\" : { },\"delay\" : 0, \"relative\": false }"; 
        break;
      case "function" : jsonAction.data = "{ \"functionName\" : \"\", \"args\":{}, \"delay\": 0 }"; 
        break;
      case "wait" : jsonAction.data = "{ \"time\": 1 }";
        break;      
      case "dialog" : jsonAction.data = "{ \"text\": \"myText\" }";
        break;
      case "other" : jsonAction.target = Phaser.Plugin.CutsceneManager.otherFunctions[0]; 
        this.otherActionChanged(jsonAction);
        break;
    }

    $scope.modalCSData.currentEvent.actions.push( jsonAction );
  }

  $scope.deleteAction = function(_action){
    var indexSplice = 0;
    for(var i = 0; i < $scope.modalCSData.currentEvent.actions.length ; i++){
      var action = $scope.modalCSData.currentEvent.actions[i];
      if( action === _action){
        indexSplice = i;
        break;
      }
    }
    $scope.modalCSData.currentEvent.actions.splice(indexSplice,1);
  }

  $scope.otherActionChanged = function(_action){
    var newData = {};

    switch( _action.target ){
      case "moveCamera" : newData = { properties : {x : 0, y:0}, delay : 0, duration : 1, relative : false};
        break;
      case "freezeInput" : newData = { keys : [] , mouse : [] };
        break;
      case "unfreezeInput" : newData = { keys : [] , mouse : [] };
        break;
    }

    _action.data = JSON.stringify( newData );
  }

  $scope.moveActionUp = function(_index){
      console.log(_index);
      if( _index == 0 ){
        return;
      }
      //switch positions
      var tempObject = $scope.modalCSData.currentEvent.actions[_index];
      $scope.modalCSData.currentEvent.actions[_index] = $scope.modalCSData.currentEvent.actions[_index - 1];
      $scope.modalCSData.currentEvent.actions[_index - 1] = tempObject;
  }
  //===============================================================
  //                NAVIGATION
  //===============================================================
  $scope.backToEvents = function(){

    //Convert back to json actions values
    for( var j=0; j < $scope.modalCSData.currentEvent.actions.length ; j++){
      var curAction = $scope.modalCSData.currentEvent.actions[j];
      if( curAction.data)
        curAction.data = jQuery.parseJSON( curAction.data);
      //clean
      if( curAction.hasOwnProperty("$$hashKey") ){
        console.log("delete " + curAction["$$hashKey"]); 
          delete curAction["$$hashKey"];
      }
    }

    $scope.modalCSData.state = "events";
    $scope.modalCSData.currentEvent = null;
  }

  $scope.backToCutscenes = function(){
    $scope.modalCSData.state = "none";
    $scope.modalCSData.currentCutscene = null;
  }

  $scope.openEditModal = function(_textContext, _textVarName, _isLong) {
    $scope.$emit("openEditModalEmit", { context : _textContext, varName : _textVarName, isLong : _isLong});
  }

  main();
};