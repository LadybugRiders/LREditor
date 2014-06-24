"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('EntitiesCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
	function main() {
		$scope.$on("refreshListBroadcast", function(_event, _args) {
			$scope.refreshList(_args.world);
		});

		$scope.entities = new Array();

		$scope.isCollapsed = true;
	};

	$scope.refreshList = function(_world) {
		if (_world != null) {
			$scope.entities = new Object();
			$timeout(function() {
				$scope.entities = _world.children;
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

	$scope.isGroup = function(_entity) {
		return _entity instanceof LR.Entity.Group
						|| _entity instanceof Phaser.Group
						|| _entity.type === Phaser.GROUP;
	};

	main();
}]);