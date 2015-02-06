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
      $scope.updateRepo();
    }

    //LOADING
    $scope.tmp.loading = $scope.networkAPI.isLoading;

    if($scope.tmp.loading){      
      $timeout( 
        function(){
          var balDtls = document.getElementById("githubDetails");
          if(balDtls.innerHTML)
            balDtls.innerHTML = "Loading " + $scope.currentLoadingAsset;
          $scope.$apply();
        }, 500
      );
    }

    $scope.$on("assetLoadedBroadcast", function(_event, _args) {
      $scope.onSingleAssetLoadedModal(_args);
    });

    $scope.$on("allAssetsLoadedBroadcast", function(_event, _args) {
      $scope.onAssetsLoadedModal(_args);
    });
  };

  $scope.authorize = function(){
    $scope.networkAPI.authorize();
  }

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

    if( $scope.tmp.loading){
      console.log("still Loading");
      return;
    }

    if( $scope.tmp.userCheck == true && $scope.tmp.selectedRepo != null && $scope.tmp.selectedBranch !=null){
      
      if($scope.isNewProjectModal()){
        //clear default level 
        //localStorage.setItem("project.levelDefault", null);
      }

      
      $scope.tmp.loading = true;
      document.getElementById("githubDetails").innerHTML = "Loading";

      $scope.networkAPI.userName = $scope.tmp.userName;
      $scope.networkAPI.currentRepoName = $scope.tmp.selectedRepo;
      $scope.networkAPI.branchName = $scope.tmp.selectedBranch;

      $scope.networkAPI.initAPI(localStorage,false,$scope.onNetworkAPIReady);

      $scope.updateRepo();
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

  //when ONE asset is loaded ( function bound to the signal )
  $scope.onSingleAssetLoadedModal = function(_data){
    document.getElementById("githubDetails").innerHTML = "Loading " + _data.nextAssetName;
  }

  //when ALL assets are loaded ( function bound to $broadcast)
  $scope.onAssetsLoadedModal = function(){
    console.log("modal assetsLoaded "+ $scope.tmp.selectedRepo);
    $scope.tmp.loading = false;
    document.getElementById("githubDetails").innerHTML = "";
  }

  //returns true if the current selected ids makes a new project
  $scope.isNewProjectModal = function(){
    return ($scope.tmp.userName != $scope.networkAPI.userName
          || $scope.tmp.selectedRepo != $scope.networkAPI.currentRepoName
          || $scope.tmp.selectedBranch != $scope.networkAPI.branchName
      );
  }

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  //Tweak because of angular not refreshing the dropdown ( same in controller_attributes)
  $scope.updateRepo = function(){
    $timeout(
      function(){
        var dropdownElmt = document.getElementById("selectRepo");
        if(dropdownElmt!=null){
          for(var i=0; i< dropdownElmt.options.length; i++){
            if(dropdownElmt.options[i].text == $scope.tmp.selectedRepo){
              dropdownElmt.options[i].selected = true;
            }else{              
              dropdownElmt.options[i].selected = false;
            }
          }
        }
      }, 500 );
  }

  main();
};