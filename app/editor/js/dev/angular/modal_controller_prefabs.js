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
      _data.prefabName = _prefab.name;
      _data.prefabPath = _prefab.path;
      $scope.$emit("importPrefabEmit", {
        prefab : _data
      });
    }).error(function(_error) {
      console.error(_error);
    });

    $modalInstance.close();
  };

  $scope.add = function () {
    if ($scope.currentEntity && $scope.tmp.prefabs.name != "") {
      var exporter = new LR.LevelExporter();
      var prefabRoot = exporter.exportEntities($scope.currentEntity);
      //Images
      var imagesKeys = exporter.getImageKeys($scope.currentEntity);
      var imagesObject = $scope.buildImagesExportObject(imagesKeys);
      //Atlases
      var atlases = exporter.getAtlases($scope.currentEntity);
      var atlasesObject = $scope.buildAtlasesExportObject(atlases);
      //This object stores the whole json, with assets to load and objects to create
      var jsonObject = { "assets" : { "images": imagesObject, "atlases" : atlasesObject }, 
                          "objects" : prefabRoot };

      var url = "/editorserverapi/v0/prefab";
      var params = {
        name: $scope.tmp.prefabs.name + ".json",
        path: $scope.project.path + "/assets/prefabs",
        data: JSON.stringify(jsonObject)
      };

      //add prefab to list is it doesn't exist yet
      var found = prefabAlreadyExists($scope,prefabRoot);
      if( ! found )
        $scope.project.assets.prefabs.push( {"name" : $scope.tmp.prefabs.name, "path" : params.path} );

      //write in file
      $http.post(url, params, function(error, data) {
          if (error) {
            console.error(error);
          } else {
            console.log("Prefab " + $scope.tmp.prefabs.name + " saved!!");
          }
        });
    }
    $scope.close();
    
  };

  $scope.close = function () {
    $modalInstance.dismiss();
  };

  //go though all images keys and get their data object from the project assets
  $scope.buildImagesExportObject = function(_keys){
    var imagesObjects = new Array();
    for( var i=0; i < _keys.length; i++){
      var key = _keys[i];
      for(var j=0; j < $scope.project.assets.images.length; j++){
        var imObj = $scope.project.assets.images[j];
        if(imObj.name == key){
          imagesObjects.push(imObj);
        }
      }
    }
    return imagesObjects;
  }

  //go though all atlases and get their data object from the project assets
  $scope.buildAtlasesExportObject = function(_keys){
    var imagesObjects = new Array();
    for( var i=0; i < _keys.length; i++){
      var key = _keys[i];
      for(var j=0; j < $scope.project.assets.atlases.length; j++){
        var imObj = $scope.project.assets.atlases[j];
        if(imObj.name == key){
          var o = new Object();
          o.name = imObj.name;
          o.path = imObj.path;
          imagesObjects.push(o);
        }
      }
    }
    return imagesObjects;
  }

  function prefabAlreadyExists(_$scope, _prefab){
     //check if prefab already exist in the list
      var i = 0;
      var found = false;
      while( i < _$scope.project.assets.prefabs.length && found == false ){
        var prefab = _$scope.project.assets.prefabs[i];
        //if the prefab already exists
        if( _$scope.tmp.prefabs.name == prefab.name ){
          found = true;
        }
        i++;
      }
      return found;
  }

  $scope.prefabNameAlreadyExists = function(_name){
     //check if prefab already exist in the list
      var i = 0;
      var found = false;
      while( i < $scope.project.assets.prefabs.length && found == false ){
        var prefab = $scope.project.assets.prefabs[i];
        //if the prefab already exists
        if( _name == prefab.name ){
          found = true;
        }
        i++;
      }
      return found;
  }

  $scope.containsSearchWord = function(_prefabName,_searchWord){
    if( _searchWord == null || _searchWord == "" )
      return true;
    if( _prefabName.indexOf(_searchWord) >= 0)
      return true;
    return false;
  }

  main();
};