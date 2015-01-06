"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('EditorCtrl', ["$scope", "$http", function($scope, $http) {
	function main() {

		//=============== ASSET MANAGET ===================
		var assetManager = new LR.Editor.AssetManager($http);

		//================== PROJECT ======================
		$scope.$on("sendProjectEmit", function(_event, _args) {
			$scope.$broadcast("sendProjectBroadcast", _args);
		});

		$scope.$on("loadBitmapFontsEmit", function(_event, _args) {
			$scope.$broadcast("loadBitmapFontsBroadcast", _args);
		});

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

		$scope.$on("addButtonEmit", function(_event) {
			$scope.$broadcast("addButtonBroadcast");
		});

		$scope.$on("addTextEmit", function(_event) {
			$scope.$broadcast("addTextBroadcast");
		});

		$scope.$on("addBitmapTextEmit", function(_event) {
			$scope.$broadcast("addBitmapTextBroadcast");
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

		$scope.$on("fixEntityToCameraEmit", function(_event, _args) {
			$scope.$broadcast("fixEntityToCameraBroadcast", _args);
		});

		$scope.$on("pickEntityEmit", function(_event, _args) {
			$scope.$broadcast("pickEntityBroadcast", _args);
		});

		$scope.$on("reassignIDEmit", function(_event, _args) {
			$scope.$broadcast("reassignIDBroadcast", _args);
		});

		$scope.$on("revertPrefabEmit", function(_event, _args) {
			$scope.$broadcast("revertPrefabBroadcast", _args);
		});

		$scope.$on("openPrefabsModalEmit", function(_event, _args) {
			$scope.$broadcast("openPrefabsModalBroadcast", _args);
		});

		$scope.$on("setHideOutOfViewEmit", function(_event, _args) {
			$scope.$broadcast("setHideOutOfViewBroadcast", _args);
		});
		//================== IMAGES ======================

		$scope.$on("getImagesEmit", function(_event, _args) {
			$scope.$broadcast("getImagesBroadcast", _args);
		});

		$scope.$on("sendImagesEmit", function(_event, _args) {
			$scope.$broadcast("sendImagesBroadcast", _args);
		});

		$scope.$on("sendLoadedImagesEmit", function(_event, _args) {
			$scope.$broadcast("sendLoadedImagesBroadcast", _args);
		});

		$scope.$on("loadImageEmit", function(_event, _args) {
			$scope.$broadcast("loadImageBroadcast", _args);
		});

		$scope.$on("unloadImageEmit", function(_event, _args) {
			$scope.$broadcast("unloadImageBroadcast", _args);
		});

		$scope.$on("sendCameraEmit", function(_event, _args) {
			$scope.$broadcast("sendCameraBroadcast", _args);
		});	

		$scope.$on("sendAtlasesEmit", function(_event, _args) {
			$scope.$broadcast("sendAtlasesBroadcast", _args);
		});

		$scope.$on("loadAtlasEmit", function(_event, _args) {
			$scope.$broadcast("loadAtlasBroadcast", _args);
		});

		$scope.$on("unloadAtlasEmit", function(_event, _args) {
			$scope.$broadcast("unloadAtlasBroadcast", _args);
		});

		//================== AUDIOS ======================
		$scope.$on("sendAudiosEmit", function(_event, _args) {
			$scope.$broadcast("sendAudiosBroadcast", _args);
		});

		//================== BEHAVIOURS ======================
		$scope.$on("sendBehavioursEmit", function(_event, _args) {
			$scope.$broadcast("sendBehavioursBroadcast", _args);
		});

		//================== FONTS ======================
		$scope.$on("sendBitmapFontsEmit", function(_event, _args) {
			$scope.$broadcast("sendBitmapFontsBroadcast", _args);
		});

		//================== WORLD & SETTINGS======================

		$scope.$on("sendWorldEmit", function(_event, _args) {
			$scope.$broadcast("sendWorldBroadcast", _args);
		});	

		$scope.$on("moveEntityToEditorEmit", function(_event, _args) {
			$scope.$broadcast("moveEntityToEditorBroadcast", _args);
		});

		//from phaser to header
		$scope.$on("sendSettingsEmit", function(_event, _args) {
			$scope.$broadcast("sendSettingsBroadcast", _args);
		});
		//from modale_settings to phaser & header
		$scope.$on("saveSettingsEmit", function(_event, _args) {
			$scope.$broadcast("saveSettingsBroadcast", _args);
		});
		
		$scope.$on("openEditModalEmit", function(_event, _args) {
			$scope.$broadcast("openEditModalBroadcast", _args);
		});
		//============= IMPORT / EXPORT ======================

		$scope.$on("importLevelEmit", function(_event, _args) {
			$scope.$broadcast("importLevelBroadcast", _args);
		});

		$scope.$on("importEntityEmit", function(_event, _args) {
			$scope.$broadcast("importEntityBroadcast", _args);
		});	

		$scope.$on("exportLevelEmit", function(_event, _args) {
			$scope.$broadcast("exportLevelBroadcast", _args);
		});	

		$scope.$on("importPrefabEmit", function(_event, _args) {
			$scope.$broadcast("importPrefabBroadcast", _args);
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


		//from the controller_header 
		$scope.$on("sendLayersEmit", function(_event, _args) {
			$scope.$broadcast("sendLayersBroadcast", _args);
		});	
	};

	main();
}]);
