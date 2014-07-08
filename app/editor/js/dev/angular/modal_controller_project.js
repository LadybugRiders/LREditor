"use strict";

var ProjectCtrlModal = function ($scope, $modalInstance, $timeout) {
  
  function main() {
    $scope.tmp.project = new Object();
    $scope.tmp.project.path = $scope.project.path;
    $scope.tmp.project.file = $scope.project.file;
  };

  $scope.changeCurrentProject = function () {
    var data = {
      path: $scope.tmp.project.path,
      file: $scope.tmp.project.file
    };

    if (localStorage) {
      localStorage.setItem("project.path", data.path);
      localStorage.setItem("project.file", data.file);

      var win = window.open(".", "_self");
    } else {
      console.warn("no localStorage");
    }

    $modalInstance.close(data);
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  main();
};