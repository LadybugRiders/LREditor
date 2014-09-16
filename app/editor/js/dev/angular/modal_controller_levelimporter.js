"use strict";

var LevelImportCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    if ($scope.tmp.levels == null) $scope.tmp.levels = new Object();
    if ($scope.tmp.levels.path == null)
      $scope.tmp.levels.path = $scope.project.path + "/assets/levels";
    if ($scope.tmp.levels.name == null) {
      if (localStorage) {
        // get last exported level
        $scope.tmp.levels.selectedPath = localStorage.getItem("project.levelDefault");
      }
    }
  };

  $scope.import = function () {
    if (localStorage) {
      var jsonIndex = $scope.tmp.levels.selectedPath.indexOf(".json");
      if( jsonIndex >= 0)
        $scope.tmp.levels.selectedPath = $scope.tmp.levels.selectedPath.substring(0,jsonIndex);
      // set level default
      localStorage.setItem("project.levelImport", $scope.tmp.levels.selectedPath);
    } else {
      console.warn("no localStorage");
    }

    var win = window.open(".", "_self");

    $modalInstance.close();
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  main();
};