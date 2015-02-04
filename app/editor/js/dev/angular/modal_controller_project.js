"use strict";

var ProjectCtrlModal = function ($scope, $modalInstance, $timeout) {
  
  function main() {
    $scope.tmp.project = new Object();
    $scope.tmp.project.path = $scope.project.path;
    $scope.tmp.project.file = $scope.project.file;
    //github
    if($scope.networkAPI.api == "github"){
      $scope.tmp.userName = $scope.networkAPI.userName;
      $scope.tmp.selectedRepo = $scope.networkAPI.currentRepoName;
      $scope.tmp.selectedBranch = $scope.networkAPI.branchName;

      $scope.tmp.userCheck = $scope.networkAPI.userCheck;
    }

    $scope.$on("assetsLoadedBroadcast", function(_event, _args) {
      $scope.onAssetsLoaded();
    });
  };

  $scope.checkUserName = function(){
    document.getElementById("githubError").innerHTML = "";
    $scope.networkAPI.getRepositories($scope.tmp.userName,
      function(_data){
        if( _data.failed == true){
          $scope.tmp.userCheck = false;
          document.getElementById("githubError").innerHTML = "User Name Error : couldn't find any repositories for "+$scope.tmp.userName;
        }else{
          $scope.tmp.userCheck = true;
          if(_data.length > 0){
            $scope.tmp.selectedRepo = _data[0].name;
            $scope.selectRepository();
          }
        }
      }
    );
  }

  $scope.selectRepository = function(){
    document.getElementById("githubError").innerHTML = "";
    $scope.networkAPI.getBranches($scope.tmp.userName, $scope.tmp.selectedRepo,
      function(_data){
        if( _data.failed == true){
          document.getElementById("githubError").innerHTML = "Repo Branches Error ";
        }else{
          //success
          if(_data.length > 0){
            $scope.tmp.selectedBranch = _data[0].name;
          }
        }
      }
    );
  }

  $scope.connectGithub = function(){

    if( $scope.tmp.userCheck == true && $scope.tmp.selectedRepo != null && $scope.tmp.selectedBranch !=null){
      
      document.getElementById("githubDetails").innerHTML = "Loading";

      $scope.networkAPI.userName = $scope.tmp.userName;
      $scope.networkAPI.currentRepoName = $scope.tmp.selectedRepo;
      $scope.networkAPI.branchName = $scope.tmp.selectedBranch;

      $scope.networkAPI.initAPI(localStorage,false,$scope.onNetworkAPIReady);
    }else{
      //try checking user
      $scope.checkUserName();
    }
  }

  $scope.changeCurrentProject = function () {
    var data = {
      path: $scope.tmp.project.path,
      file: $scope.tmp.project.file
    };

    if (localStorage) {
      // clear localStorage
      localStorage.clear();

      // set new project path
      localStorage.setItem("project.path", data.path);
      // set new project.json file
      localStorage.setItem("project.file", data.file);

      var win = window.open(".", "_self");
    } else {
      console.warn("no localStorage");
    }

    $modalInstance.close(data);
  };

  $scope.onAssetsLoaded = function(){
    console.log("modal assetsLoaded");
    document.getElementById("githubDetails").innerHTML = "";
  }

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  main();
};