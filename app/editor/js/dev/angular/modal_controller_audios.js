"use strict";

var AudiosCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
  };

  $scope.loadAudio = function (_audio) {
    _audio.loaded = true;
    //$scope.$emit("loadAudioEmit", {audio: _audio});
  };

  $scope.unloadAudio = function (_audio) {
    _audio.loaded = false;
    //$scope.$emit("unloadAudioEmit", {audio: _audio});
  };

  $scope.containsSearchWord = function(_audioName, _searchWord){
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