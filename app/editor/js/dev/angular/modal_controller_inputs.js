"use strict";

var InputsCtrlModal = function ($scope, $modalInstance, $timeout) {
  
  function main() {
    //Create keys if null
    if( $scope.modalInputsData.keys == null)
      $scope.buildKeys();
    //copy data of input
    $scope.modalInputsData.inputs = jQuery.extend(true, {}, $scope.project.assets.inputs );
    //convert keys values to keys ids ie 32 => "SPACEBAR"
    for(var actionName in $scope.modalInputsData.inputs){
      var keyData = $scope.modalInputsData.inputs[actionName];
      keyData.key = $scope.findKeyNameByValue(keyData.key);
    }
  };

  $scope.save = function () {
    //Convert keys ids to key values ie : "SPACEBAR" => 32
    for(var actionName in $scope.modalInputsData.inputs){
      var keyData = $scope.modalInputsData.inputs[actionName];
      keyData.key = $scope.modalInputsData.keys[keyData.key];
    }
    //Save
    try {
      $scope.project.assets.inputs = $scope.modalInputsData.inputs;
    } catch(e) {
      $scope.modalInputsData.inputs = new Object();
      console.error(e);
    }

    $modalInstance.close($scope.modalInputsData.inputs);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  //================================================
  //            ADD / DELETE
  //================================================

  $scope.addInput = function (_actionName) {
    if( _actionName && !$scope.modalInputsData.inputs.hasOwnProperty(_actionName) ){
      $scope.modalInputsData.inputs[_actionName] = {key:"",capture:false};
    }
  };

  $scope.deleteInput = function (_actionName) {
    if( $scope.modalInputsData.inputs.hasOwnProperty(_actionName) ){
      delete $scope.modalInputsData.inputs[_actionName];
    }
  };

  //================================================
  //              KEYS 
  //================================================

  $scope.findKeyNameByValue = function(_value){
    for(var key in $scope.modalInputsData.keys){
      if( $scope.modalInputsData.keys[key] == _value ){
        return key;
      }
    }
    return null;
  }

  $scope.buildKeys = function(){
    $scope.modalInputsData.keys = {
      A : "A".charCodeAt(0),
      B : "B".charCodeAt(0),
      C : "C".charCodeAt(0),
      D : "D".charCodeAt(0),
      E : "E".charCodeAt(0),
      F : "F".charCodeAt(0),
      G : "G".charCodeAt(0),
      H : "H".charCodeAt(0),
      I : "I".charCodeAt(0),
      J : "J".charCodeAt(0),
      K : "K".charCodeAt(0),
      L : "L".charCodeAt(0),
      M : "M".charCodeAt(0),
      N : "N".charCodeAt(0),
      O : "O".charCodeAt(0),
      P : "P".charCodeAt(0),
      Q : "Q".charCodeAt(0),
      R : "R".charCodeAt(0),
      S : "S".charCodeAt(0),
      T : "T".charCodeAt(0),
      U : "U".charCodeAt(0),
      V : "V".charCodeAt(0),
      W : "W".charCodeAt(0),
      X : "X".charCodeAt(0),
      Y : "Y".charCodeAt(0),
      Z : "Z".charCodeAt(0),
      ZERO : "0".charCodeAt(0),
      ONE : "1".charCodeAt(0),
      TWO : "2".charCodeAt(0),
      THREE : "3".charCodeAt(0),
      FOUR : "4".charCodeAt(0),
      FIVE : "5".charCodeAt(0),
      SIX : "6".charCodeAt(0),
      SEVEN : "7".charCodeAt(0),
      EIGHT : "8".charCodeAt(0),
      NINE : "9".charCodeAt(0),
      NUMPAD_0 : 96,
      NUMPAD_1 : 97,
      NUMPAD_2 : 98,
      NUMPAD_3 : 99,
      NUMPAD_4 : 100,
      NUMPAD_5 : 101,
      NUMPAD_6 : 102,
      NUMPAD_7 : 103,
      NUMPAD_8 : 104,
      NUMPAD_9 : 105,
      NUMPAD_MULTIPLY : 106,
      NUMPAD_ADD : 107,
      NUMPAD_ENTER : 108,
      NUMPAD_SUBTRACT : 109,
      NUMPAD_DECIMAL : 110,
      NUMPAD_DIVIDE : 111,
      F1 : 112,
      F2 : 113,
      F3 : 114,
      F4 : 115,
      F5 : 116,
      F6 : 117,
      F7 : 118,
      F8 : 119,
      F9 : 120,
      F10 : 121,
      F11 : 122,
      F12 : 123,
      F13 : 124,
      F14 : 125,
      F15 : 126,
      COLON : 186,
      EQUALS : 187,
      UNDERSCORE : 189,
      QUESTION_MARK : 191,
      TILDE : 192,
      OPEN_BRACKET : 219,
      BACKWARD_SLASH : 220,
      CLOSED_BRACKET : 221,
      QUOTES : 222,
      BACKSPACE : 8,
      TAB : 9,
      CLEAR : 12,
      ENTER : 13,
      SHIFT : 16,
      CONTROL : 17,
      ALT : 18,
      CAPS_LOCK : 20,
      ESC : 27,
      SPACEBAR : 32,
      PAGE_UP : 33,
      PAGE_DOWN : 34,
      END : 35,
      HOME : 36,
      LEFT : 37,
      UP : 38,
      RIGHT : 39,
      DOWN : 40,
      INSERT : 45,
      DELETE : 46,
      HELP : 47,
      NUM_LOCK : 144
    }
}
  main();
};