"use strict";

// get module Loopy.controllers
var loopyCtrlMod = angular.module('Loopy.controllers');

// create controller LoginCtrol in the module Loopy.controllers
loopyCtrlMod.controller('ObjectsCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
	function main() {
		$scope.$on("refreshListBroadcast", function(_event, _args) {
			$scope.refreshList(_args.world);
		});

		$scope.objects = new Array();

		$scope.isCollapsed = true;
	};

	$scope.refreshList = function(_world) {
		if (_world != null) {
			$scope.objects = new Object();
			$timeout(function() {
				$scope.objects = _world.children;
			}, 100);
		}
	};

	$scope.selectEntity = function(_entity) {
		$scope.$emit("selectEntityEmit", {entity: _entity});
	}

	$scope.moveDown = function(_entity) {
		if (_entity.parent) {
			_entity.parent.moveDown(_entity);
		} else {
			console.warn("no parent");
		}
	};

	$scope.moveUp = function(_entity) {
		if (_entity.parent) {
			_entity.parent.moveUp(_entity);
		} else {
			console.warn("no parent");
		}
	};

	$scope.addGroup = function() {
		$scope.$emit("addGroupEmit");
	};

	$scope.addSprite = function() {
		$scope.$emit("addSpriteEmit");
	};

	$scope.addTileSprite = function() {
		$scope.$emit("addTileSpriteEmit");
	};

	$scope.isGroup = function(_entity) {
		return _entity instanceof LR.Entity.Group
						|| _entity instanceof Phaser.Group;
	};

	main();
}]);