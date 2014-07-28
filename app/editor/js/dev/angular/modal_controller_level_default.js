"use strict";

var LevelDefaultCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    if ($scope.tmp.levels == null) $scope.tmp.levels = new Object();
    if ($scope.tmp.levels.name == null) {
      if (localStorage) {
        // get last exported level
        $scope.tmp.levels.name = localStorage.getItem("project.levelDefault");
        
        if ($scope.tmp.levels.name == null) {
          $scope.tmp.levels.name = "example";
        }
      }
    }
  };

  $scope.setDefault = function (_reload) {
    if (localStorage) {
      // set level default
      localStorage.setItem("project.levelDefault", $scope.tmp.levels.name);
    } else {
      console.warn("no localStorage");
    }

    if (_reload == true) {
      var win = window.open(".", "_self");
    }

    $modalInstance.close();
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  main();
};