"use strict";

var LevelExportCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    if ($scope.tmp.levels == null) $scope.tmp.levels = new Object();
    if ($scope.tmp.levels.path == null)
      $scope.tmp.levels.path = $scope.project.path + "/assets/levels";
    if ($scope.tmp.levels.name == null) {
      if (localStorage) {
        // get last exported level
        $scope.tmp.levels.name = localStorage.getItem("project.levelDefault").substring(1);
        
        if ($scope.tmp.levels.name == null) {
          $scope.tmp.levels.name = "example";
        }
      }
    }
  };

  $scope.export = function () {
    var data = {
      levelName: $scope.tmp.levels.name,
      levelPath: $scope.tmp.levels.path,
      levelStorage: "file"
    };

    $modalInstance.close(data);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  $scope.onSelectLevel = function () {    
    $scope.tmp.levels.name = $scope.tmp.levels.selectedLevel.shortPath;
  };

  main();
};