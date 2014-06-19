"use strict";

var ImagesLoadCtrlModal = function ($scope, $modalInstance, $timeout) {

  function main() {
    $scope.$emit("getImagesEmit");
  };

  $scope.loadImage = function () {
    var copy = $scope.copyData();
    $scope.clearData();
    $scope.$emit("loadImageEmit", copy);

    $timeout(function() {
      $scope.$emit("getImagesEmit");
    }, 1500, true);
  };

  $scope.deleteImage = function (_image) {
    $scope.$emit("deleteImageEmit", {image: _image});

    $timeout(function() {
      $scope.$emit("getImagesEmit");
    }, 1500, true);
  };

  $scope.copyData = function() {
    var copy = {
      path: $scope.modalData.imagesPath,
      name: $scope.modalData.imagesName,
      frameWidth: parseInt($scope.modalData.imagesFrameWidth),
      frameHeight: parseInt($scope.modalData.imagesFrameHeight)
    }

    return copy;
  }

  $scope.clearData = function() {
    $scope.modalData.imagesPath = "";
    $scope.modalData.imagesName = "";
    $scope.modalData.imagesFrameWidth = 32;
    $scope.modalData.imagesFrameHeight = 32;
  };

  $scope.close = function () {
    $modalInstance.close();
  };

  main();
};