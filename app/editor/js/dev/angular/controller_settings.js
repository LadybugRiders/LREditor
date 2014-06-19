"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('SettingsCtrl', ["$scope", "$http", "$timeout",
	function($scope, $http, $timeout) {
	function main() {
		$scope.data = {
			cameraX: 0,
			cameraY: 0,
			worldWidth: 0,
			worldHeight: 0,
		};

		$scope.$on("sendSettingsBroadcast", function(_event, _args) {
			$scope.camera = _args.camera;
			console.log("yay");
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