"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('EntitiesCtrl', ["$scope", "$http", "$modal", "$timeout", 
	function($scope, $http, $modal, $timeout) {
	function main() {
		$scope.$on("sendProjectBroadcast", function(_event, _args) {
			$scope.project = _args.project;
		});
		
		$scope.$on("refreshListBroadcast", function(_event, _args) {
			$scope.refreshList(_args.world);
		});

		$scope.$on("pickEntityBroadcast", function(_event, _args) {
			$scope.openPickEntityModal(_args.context, _args.callback, _args.currentPick);
		});

		//when selected from phaser
		$scope.$on("selectEntityBroadcast", function(_event, _args) {
			if( _args.phaser ){
				$scope.currentEntity = _args.entity;
				$scope.$apply();
			}
		});

		$scope.entities = new Array();
		$scope.modalPickData = {pickedEntity:null};

		$scope.isCollapsed = true;
	};

	$scope.refreshList = function(_world) {
		if (_world != null) {
			$timeout(function() {
				$scope.entities = new Array();
				$scope.entities.push(_world);
			}, 100);
		}
	};

	$scope.selectEntity = function(_entity) {
		$scope.$emit("selectEntityEmit", {entity: _entity});
		$scope.currentEntity = _entity;
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

	$scope.getNbChildren = function(_entity) {
		var cpt = 0;
		for (var i = _entity.children.length - 1; i >= 0; i--) {
			var child = _entity.children[i];
			if( child.name == null )
				continue;
			if ((child.name[0] == "_" && child.name[1] == "_") == false) {
				cpt++;
			}
		};

		return cpt;
	}

	//===============================================================
	//					PICK GAMEOBJECT
	//===============================================================

	$scope.openPickEntityModal = function(_context,_callback,_currentPick){
		$scope.modalPickData.pickedEntity = _currentPick;
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/pick_entity_modal.html',
			controller: PickEntityCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			if( _callback != null )
				_callback.call(_context, _data);
		}, function () {
			if( _callback != null )
				_callback.call(_context, null);
			// clean modal data
			console.info('Modal dismissed at: ' + new Date());
		});
	}

	main();
}]);