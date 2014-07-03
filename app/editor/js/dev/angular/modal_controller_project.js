"use strict";

var ProjectCtrlModal = function ($scope, $modalInstance, $timeout) {
  
  function main() {
    $scope.modalProjectData.projectNameTmp = $scope.modalProjectData.projectName;
    $scope.modalProjectData.projectPathTmp = $scope.modalProjectData.projectPath;
    $scope.modalProjectData.projectFileTmp = $scope.modalProjectData.projectFile;
  };

  $scope.changeCurrentProject = function () {
    var data = {
      projectName: $scope.modalProjectData.projectNameTmp,
      projectPath: $scope.modalProjectData.projectPathTmp,
      projectFile: $scope.modalProjectData.projectFileTmp
    };

    if (localStorage) {
      localStorage.setItem("projectName", data.projectName);
      localStorage.setItem("projectPath", data.projectPath);
      localStorage.setItem("projectFile", data.projectFile);

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