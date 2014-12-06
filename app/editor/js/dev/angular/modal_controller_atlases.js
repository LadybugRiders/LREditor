"use strict";

var AtlasesCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
  };

  $scope.loadAtlas = function (_image) {
    $scope.$emit("loadAtlasEmit", {atlas: _image});
  };

  $scope.unloadAtlas = function (_image) {
    $scope.$emit("unloadAtlasEmit", {atlas: _image});
  };

  $scope.containsSearchWord = function(_imageName,_searchWord){
    if( _searchWord == null || _searchWord == "" )
      return true;
    if( _imageName.indexOf(_searchWord) > 0)
      return true;
    return false;
  }

  $scope.close = function () {
    $modalInstance.close();
  };

  main();
};