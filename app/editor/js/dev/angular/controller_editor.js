"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('EditorCtrl', ["$scope", "$http", function($scope, $http) {
	function main() {

		//================== REFRESH ======================

		$scope.$on("refreshListEmit", function(_event, _args) {
			$scope.$broadcast("refreshListBroadcast", _args);
		});

		$scope.$on("refreshCurrentEntityEmit", function(_event, _args) {
			$scope.$broadcast("refreshCurrentEntityBroadcast", _args);
		});

		//============ ADDING ENTITIES ===================

		$scope.$on("addGroupEmit", function(_event) {
			$scope.$broadcast("addGroupBroadcast");
		});

		$scope.$on("addSpriteEmit", function(_event) {
			$scope.$broadcast("addSpriteBroadcast");
		});

		$scope.$on("addTileSpriteEmit", function(_event) {
			$scope.$broadcast("addTileSpriteBroadcast");
		});

		//================== CLONE & STUFF ======================

		$scope.$on("cloneEntityEmit", function(_event, _args) {
			$scope.$broadcast("cloneEntityBroadcast", _args);
		});

		$scope.$on("deleteEntityEmit", function(_event, _args) {
			$scope.$broadcast("deleteEntityBroadcast", _args);
		});

		$scope.$on("lockEntityEmit", function(_event, _args) {
			$scope.$broadcast("lockEntityBroadcast", _args);
		});

		$scope.$on("selectEntityEmit", function(_event, _args) {
			$scope.$broadcast("selectEntityBroadcast", _args);
		});

		//================== IMAGES ======================

		$scope.$on("getImagesEmit", function(_event, _args) {
			$scope.$broadcast("getImagesBroadcast", _args);
		});

		$scope.$on("sendImagesEmit", function(_event, _args) {
			$scope.$broadcast("sendImagesBroadcast", _args);
		});

		$scope.$on("loadImageEmit", function(_event, _args) {
			$scope.$broadcast("loadImageBroadcast", _args);
		});

		$scope.$on("deleteImageEmit", function(_event, _args) {
			$scope.$broadcast("deleteImageBroadcast", _args);
		});

		$scope.$on("sendCameraEmit", function(_event, _args) {
			$scope.$broadcast("sendCameraBroadcast", _args);
		});	

		//================== WORLD & SETTINGS======================

		$scope.$on("sendWorldEmit", function(_event, _args) {
			$scope.$broadcast("sendWorldBroadcast", _args);
		});	

		$scope.$on("moveEntityToEditorEmit", function(_event, _args) {
			$scope.$broadcast("moveEntityToEditorBroadcast", _args);
		});


		$scope.$on("sendSettingsEmit", function(_event, _args) {
			$scope.$broadcast("sendSettingsBroadcast", _args);
		});

		$scope.$on("changeGameCameraEmit", function(_event, _args) {
			$scope.$broadcast("changeGameCameraBroadcast", _args);
		});
		
		$scope.$on("openEditModalEmit", function(_event, _args) {
			$scope.$broadcast("openEditModalBroadcast", _args);
		});
		//============= IMPORT / EXPORT ======================

		$scope.$on("importLevelEmit", function(_event, _args) {
			$scope.$broadcast("importLevelBroadcast", _args);
		});	

		$scope.$on("exportLevelEmit", function(_event, _args) {
			$scope.$broadcast("exportLevelBroadcast", _args);
		});	

		$scope.$on("importCutsceneEmit", function(_event, _args) {
			$scope.$broadcast("importCutsceneBroadcast", _args);
		});	

		$scope.$on("exportCutsceneEmit", function(_event, _args) {
			$scope.$broadcast("exportCutsceneBroadcast", _args);
		});	
		//from controller_header to controller_phaser
		$scope.$on("saveCutscenesEmit", function(_event, _args) {
			$scope.$broadcast("saveCutscenesBroadcast", _args);
		});	
		//from the controller_phaser after an import to controller_header
		$scope.$on("sendCutscenesEmit", function(_event, _args) {
			$scope.$broadcast("sendCutscenesBroadcast", _args);
		});	
	};

	main();
}]);
