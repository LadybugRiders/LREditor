"use strict";

// get module Loopy.controllers
var loopyCtrlMod = angular.module('Loopy.controllers');

// create controller LoginCtrol in the module Loopy.controllers
loopyCtrlMod.controller('SettingsCtrl', ["$scope", "$http", "$timeout",
	function($scope, $http, $timeout) {
	function main() {
		$scope.data = {
			cameraX: 0,
			cameraY: 0,
			worldWidth: 0,
			worldHeight: 0,
		};

		$scope.$on("sendCameraBroadcast", function(_event, _args) {
			$scope.camera = _args.camera;

			$scope.data.cameraX = $scope.camera.x;
			$scope.data.cameraY = $scope.camera.y;
		});

		$scope.$on("sendWorldBroadcast", function(_event, _args) {
			$scope.world = _args.world;

			$scope.data.worldWidth = $scope.world.width;
			$scope.data.worldHeight = $scope.world.height;
		});
	};

	$scope.changeCamera = function() {
		if ($scope.camera) {
			$scope.camera.x = parseInt($scope.data.cameraX);
			$scope.camera.y = parseInt($scope.data.cameraY);
		}
	};

	$scope.changeWorld = function() {
		if ($scope.world) {
			$scope.world.setBounds(
				0, 0, $scope.data.worldWidth, $scope.data.worldHeight);
		}
	};

	main();
}]);