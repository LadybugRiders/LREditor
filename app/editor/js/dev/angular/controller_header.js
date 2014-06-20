"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('HeaderCtrl', ["$scope", "$http", "$modal", "$timeout", 
	function($scope, $http, $modal, $timeout) {
	function main() {

		$scope.images = new Array();

		$scope.$on("sendImagesBroadcast", function(_event, _args) {
			if (_args.images) {
				$scope.images = _args.images;
			}
		});

		$scope.$on("importCutsceneBroadcast", function(_event, _args) {
			$scope.importCutscene();
		});

		$scope.$on("openEditModalBroadcast", function(_event, _args) {
			$scope.openEditModal(_args.context,_args.varName,_args.isLong);
		});

		$scope.$on("sendCutscenesBroadcast", function(_event, _args) {
			$scope.setCutscenes(_args.cutscenes);
		});

		//Receive settings from phaser when importing
		$scope.$on("sendSettingsBroadcast", function(_event, _args) {
			$scope.modalSettingsSave = jQuery.extend(true, {}, _args);
			$scope.modalSettingsData = jQuery.extend(true, {}, _args);
		});
		//When settings are modified in the modal
		$scope.$on("saveSettingsBroadcast", function(_event, _args) {
			$scope.modalSettingsSave = jQuery.extend(true, {}, _args);
			$scope.modalSettingsData = jQuery.extend(true, {}, _args);
		});


		$scope.modalData = {
			// images
			imagesPath: "/game/assets/images/loopy/loopy_temp.png",
	      	imagesName: "loopy",
	      	imagesFrameWidth: 32,
	      	imagesFrameHeight: 32,
			// level import/export
			levelPath: "app/game/assets/levels",
			levelName: "level1"
		};

		//modal data for cutscenes edition
		$scope.modalCSData = {
			state : "none",
			otherFuncs : Phaser.Plugin.CutsceneManager.otherFunctions,
			cutscenes : []
		};

		//for text editing
		$scope.modalEditData = {
			edit_text : "",
			context : null,
			varName : "",
			isLong : false
		};

		$scope.modalSettingsData = {
			world :{},
			camera : {}
		};
	};

	$scope.play = function() {
		var levelName = "levelTmp";
		var storage = "localstorage";

		$scope.$emit("exportLevelEmit", {
			levelName: levelName,
			levelStorage: storage
		});

		$timeout(function() {
			var url = "../game/#/home";
			url += "?levelname=" + levelName;
			url += "&storage=" + storage;
			var win = window.open(url, '_blank');
	  		win.focus();
		}, 100);
	};

	/******************
	** IMAGES LOADER **
	******************/

	$scope.imagesLoad = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/imagesload.html',
			controller: ImagesLoadCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			// do nothing
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	};

	/******************
	** ADDING ENTITIES **
	******************/

	$scope.addGroup = function() {
		$scope.$emit("addGroupEmit");
	};

	$scope.addSprite = function() {
		$scope.$emit("addSpriteEmit");
	};

	$scope.addTileSprite = function() {
		$scope.$emit("addTileSpriteEmit");
	};

	$scope.addText = function() {
		$scope.$emit("addTextEmit");
	};

	/*******************
	** LEVEL IMPORTER **
	*******************/

	$scope.levelImport = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/levelimport.html',
			controller: LevelImportCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			// send message to EditorCtrl
			$scope.$emit("importLevelEmit", _data);
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	};

	/*******************
	** LEVEL EXPORTER **
	*******************/

	$scope.levelExport = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/levelexport.html',
			controller: LevelExportCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			// send message to EditorCtrl
			$scope.$emit("exportLevelEmit", _data);
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	};


	/*******************
	** SETTINGS **
	*******************/

	$scope.openSettings = function(){
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/settings_modal.html',
			controller: SettingsCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	}

	/*******************
	** CUTSCENE EDITOR **
	*******************/

	$scope.openCutsceneEditor = function(){
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/cutscene_editor_modal.html',
			controller: CutsceneEditorCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
		}, function () {
	        $scope.modalCSData.state = "none";
			console.info('Modal dismissed at: ' + new Date());
		});
	}

	$scope.exportCutscene = function(){		
		console.log($scope.cutscenesSave);
		//Tells the controller_phaser to store the modified cutscenes
		$scope.$emit("saveCutscenesEmit",{"cutscenes":$scope.cutscenesSave});
	}

	$scope.setCutscenes = function(_cutscenes){		
		//keep the original. only overwritten when saved
		$scope.cutscenesSave = _cutscenes;

		//clone the array. we don't want modifications to be done directly on the object
		$scope.modalCSData.cutscenes = jQuery.extend(true, [], _cutscenes);
	}

	/*******************
	*******  HELP *******
	*******************/

	$scope.help = function(){
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/help_modal.html',/*
			controller: LevelExportCtrlModal,*/
			resolve: {
			}
		});

		$scope.closeHelp = function() {modalInstance.dismiss();};

		modalInstance.result.then(function (_data) {
			modalInstance.dismiss();
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	}

	/*
	* Opens the Edit Modal. At validation, this will modify the _textVarName varialbe of the _textContext
	*/
	$scope.openEditModal = function(_textContext, _textVarName, _isLong) {

		$scope.modalEditData.edit_text = _textContext[_textVarName];
		$scope.modalEditData.context = _textContext;
		$scope.modalEditData.varName = _textVarName;

		//if _isLong is true, the modal will propose a text area
		if( _isLong )
			$scope.modalEditData.isLong = _isLong;
		else
			$scope.modalEditData.isLong = false;

		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/edit_text_modal.html',
			controller: EditTextCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			// clean modal data
			$scope.modalEditData.edit_text = "";
			$scope.modalEditData.context = null;
			$scope.modalEditData.varName = "";
		}, function () {
			// clean modal data
			$scope.modalEditData.context = null;
			console.info('Modal dismissed at: ' + new Date());
		});
	};

	main();
}]);