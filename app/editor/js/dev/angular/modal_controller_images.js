"use strict";

var ImagesCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
  };

  $scope.loadImage = function (_image) {
    $scope.$emit("loadImageEmit", {image: _image});
  };

  $scope.unloadImage = function (_image) {
    $scope.$emit("unloadImageEmit", {image: _image});
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