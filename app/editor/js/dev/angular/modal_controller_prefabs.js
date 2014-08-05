"use strict";

var PrefabsCtrlModal = function ($scope, $modalInstance, $http) {
  
  function main() {
    if ($scope.currentEntity) {
      $scope.tmp.prefabs = new Object();
      $scope.tmp.prefabs.name = $scope.currentEntity.name;
    }
  };

  $scope.import = function (_prefab) {
    var url = "/editorserverapi/v0/prefab/" + _prefab.name;
    url += "?path=" + $scope.project.path + "/assets/prefabs";
    $http.get(url).success(function(_data) {
      $scope.$emit("importEntityEmit", {
        entity: _data
      });
    }).error(function(_error) {
      console.error(_error);
    });

    $modalInstance.close();
  };

  $scope.add = function () {
    if ($scope.currentEntity && $scope.tmp.prefabs.name != "") {
      var exporter = new LR.LevelExporter();
      var prefab = exporter.exportEntities($scope.currentEntity);

      var url = "/editorserverapi/v0/prefab";
      var params = {
        name: $scope.tmp.prefabs.name + ".json",
        path: $scope.project.path + "/assets/prefabs",
        data: JSON.stringify(prefab)
      };

      //add prefab to list
      var i = 0;
      var found = false;
      while( i < $scope.project.assets.prefabs.length && found == false ){
        var prefab = $scope.project.assets.prefabs[i];
        //if the prefab already exists
        if( params.name.indexOf(prefab.name) >= 0){
          found = true;
        }else{
          i++;
        }
      }
      if( ! found )
        $scope.project.assets.prefabs.push( {"name" : params.name, "path" : params.path} );

      $http.post(url, params, function(error, data) {
          if (error) {
            console.error(error);
          } else {
            console.log("Prefab " + $scope.tmp.prefabs.name + " saved!!");
          }
        });
    }
    
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  main();
};