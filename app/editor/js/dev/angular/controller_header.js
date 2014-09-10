"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('HeaderCtrl', ["$scope", "$http", "$modal", "$timeout", 
	function($scope, $http, $modal, $timeout) {
	function main() {
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

		$scope.$on("refreshCurrentEntityBroadcast", function(_event, _args) {
			$scope.currentEntity = _args.entity;
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

		// tmp object (for modals for example)
		$scope.tmp = new Object();

		// project data
		$scope.project = {
			name: "Project",
      path: "/game",
      file: "project.json"
		};

		// project assets
		$scope.project.assets = new Object();

		$scope.project.assets.levels = new Array();
		$scope.project.assets.images = new Array();
		$scope.project.assets.audios = new Object();
		$scope.project.assets.layers = new Object();
		$scope.project.assets.behaviours = new Array();
		$scope.project.assets.prefabs = new Array();
		$scope.project.assets.inputs = new Object();
		$scope.project.assets.bitmapFonts = new Array();

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
			camera : {},
			debugBodiesInGame : false
		};

		$scope.modalLayersData = { layers : {} };
		$scope.modalInputsData = { inputs : {} };

		// load current project data
		if (localStorage) {
			var path = localStorage.getItem("project.path");
			var file = localStorage.getItem("project.file");
			if (path && file) {
				$scope.project.path = path;
				$scope.project.file = file;
			}

			$scope.loadCurrentProjectData();
    } else {
      console.warn("no localStorage");
    }
	};

	$scope.play = function() {
		var levelName = "levelTmp";
		var storage = "localstorage";

		$scope.$emit("exportLevelEmit", {
			levelName: levelName,
			levelStorage: storage
		});

		$timeout(function() {
			//var url = "/game/#/home";
			var url = $scope.project.path;
			url += "?levelname=" + levelName;
			url += "&storage=" + storage;
			var win = window.open(url, '_blank');
	  		win.focus();
		}, 100);
	};

	/************
	** PROJECT **
	************/

	$scope.loadCurrentProjectData = function() {
		var url = "/editorserverapi/v0/project";
		url += "?name=" + $scope.project.file;
		url += "&path=" + $scope.project.path;
		$http.get(url).success(function(_data) {
			$scope.project.name = _data.name;
			$scope.project.projectFirstLevel = _data.firstLevel;

			$timeout(function() {
				$scope.$emit("sendProjectEmit", {project: $scope.project});
			}, 100);

			$scope.loadCurrentProjectPrefabs();
			$scope.loadCurrentProjectImages();
			$scope.loadCurrentProjectAudios();
			$scope.loadCurrentProjectBehaviours();
			$scope.loadCurrentProjectLayers();
			$scope.loadCurrentProjectInputs();
			$scope.loadCurrentProjectFonts();
			$scope.loadCurrentProjectLevels();
		}).error(function(_error) {
			console.error(_error);
		});
	};

	$scope.changeCurrentProject = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/project.html',
			controller: ProjectCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			$scope.project = _data;
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	};

	$scope.newLevel = function(){
		localStorage.setItem("project.newLevel", true);
       	var win = window.open(".", "_self");
	}

	/***********
	** IMAGES **
	***********/

	$scope.loadCurrentProjectImages = function() {
		var url = "/editorserverapi/v0/image";
		url += "?path=" + $scope.project.path + "/assets/images";
		$http.get(url).success(function(_data) {
			$scope.project.assets.images = _data.images;

			$scope.$emit("sendImagesEmit", {images: $scope.project.assets.images});
		}).error(function(_error) {
			$scope.images = new Object();
			console.error(_error);
		});
	};

	$scope.manageImages = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/images.html',
			controller: ImagesCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			// do nothing
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	};

	/***********
	** AUDIOS **
	***********/

	$scope.loadCurrentProjectAudios = function() {
		var url = "/editorserverapi/v0/audio";
		url += "?path=" + $scope.project.path + "/assets/audios";
		$http.get(url).success(function(_data) {
			$scope.project.assets.audios = _data.audios;

			$scope.$emit("sendAudiosEmit", {audios: $scope.project.assets.audios});
		}).error(function(_error) {
			$scope.audios = new Object();
			console.error(_error);
		});
	};

	$scope.manageAudios = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/audios.html',
			controller: AudiosCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			// do nothing
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	};

	/***********
	** LAYERS **
	***********/
	//Load the layers file and build/send the layers names array
	$scope.loadCurrentProjectLayers = function() {
		var url = "/editorserverapi/v0/layers";
		url += "?name=layers.json";
		url += "&path=" + $scope.project.path + "/assets/physics";
		$http.get(url).success(function(_data) {
			$scope.project.assets.layers = _data;
		    $scope.$emit("sendLayersEmit", {"layers": $scope.project.assets.layers });
		}).error(function(_error) {
			$scope.layers = new Object();
			console.error(_error);
		});
	}

	$scope.manageLayers = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/layers.html',
			controller: LayersCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			$scope.project.assets.layers = jQuery.extend(true, {}, _data);
    		$scope.$emit("sendLayersEmit",{"layers" : _data });
			// save layers data in a file
			var url = "/editorserverapi/v0/layers";
		    var params = {
		        name: "layers.json",
		        path: $scope.project.path + "/assets/physics",
		        data: JSON.stringify($scope.project.assets.layers)
		    };
      	$http.post(url, params, function(error, data) {
	        if (error) {
	          console.error(error);
	        } else {
	          console.log("Layers saved!!");
	        }
      	});
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	};

	/***************
	** BEHAVIOURS **
	***************/

	$scope.loadCurrentProjectBehaviours = function() {
		var url = "/editorserverapi/v0/behaviour";
		url += "?path=" + $scope.project.path + "/assets/behaviours";
		$http.get(url).success(function(_data) {
			$scope.project.assets.behaviours = _data.behaviours;

			$scope.$emit("sendBehavioursEmit", {behaviours: $scope.project.assets.behaviours});
		}).error(function(_error) {
			$scope.behaviours = new Object();
			console.error(_error);
		});
	}

	$scope.manageBehaviours = function() {
		// nothing to do
	};

	/************
	** PREFABS **
	************/

	$scope.loadCurrentProjectPrefabs = function() {
		var url = "/editorserverapi/v0/prefab";
		url += "?path=" + $scope.project.path + "/assets/prefabs";
		$http.get(url).success(function(_data) {
			$scope.project.assets.prefabs = _data.prefabs;
			//clean .old
			for( var i=0; i < $scope.project.assets.prefabs.length; i++ ){
				var prefab = $scope.project.assets.prefabs[i];
				if( prefab.name.indexOf(".old") >= 0){
					$scope.project.assets.prefabs.splice(i,1);
				}
			}
		}).error(function(_error) {
			$scope.project.assets.prefabs = new Array();
			console.error(_error);
		});

	};

	$scope.managePrefabs = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/prefabs.html',
			controller: PrefabsCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			// do nothing
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	};

	/***********
	** FONTS **
	***********/

	$scope.loadCurrentProjectFonts = function() {
		var url = "/editorserverapi/v0/bitmapfont";
		url += "?path=" + $scope.project.path + "/assets/fonts";
		$http.get(url).success(function(_data) {
			$scope.project.assets.bitmapFonts = _data.fonts;
			$scope.$emit("sendBitmapFontsEmit",{bitmapFonts : $scope.project.assets.bitmapFonts});
		}).error(function(_error) {
			$scope.project.assets.bitmapFonts = new Array();
			console.error(_error);
		});

	};

	/***********
	** LEVELS **
	***********/

	$scope.loadCurrentProjectLevels = function() {
		var url = "/editorserverapi/v0/prefab";
		url += "?path=" + $scope.project.path + "/assets/levels";
		$http.get(url).success(function(_data) {
			$scope.project.assets.levels = JSON.parse(JSON.stringify(_data.prefabs));
			for( var i=0; i < $scope.project.assets.levels.length; i++ ){
				var prefab = $scope.project.assets.levels[i];
				if( prefab.name.indexOf(".old") >= 0){
					$scope.project.assets.levels.splice(i,1);
				}
			}
			//$scope.$emit("sendBitmapFontsEmit",{bitmapFonts : $scope.project.assets.bitmapFonts});
		}).error(function(_error) {
			$scope.project.assets.allLevels = new Array();
			console.error(_error);
		});

	};

	/***********
	** INPUTS **
	***********/

	$scope.loadCurrentProjectInputs = function() {
		var url = "/editorserverapi/v0/inputs";
		url += "?name=inputs.json";
		url += "&path=" + $scope.project.path + "/assets/inputs";
		$http.get(url).success(function(_data) {
			$scope.project.assets.inputs = _data;
		}).error(function(_error) {
			$scope.project.assets.inputs = new Object();
			console.error(_error);
		});
	}

	$scope.manageInputs = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/inputs.html',
			controller: InputsCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			// save inputs data in a file
			var url = "/editorserverapi/v0/inputs";
      var params = {
        name: "inputs.json",
        path: $scope.project.path + "/assets/inputs",
        data: JSON.stringify($scope.project.assets.inputs)
      };
      $http.post(url, params, function(error, data) {
        if (error) {
          console.error(error);
        } else {
          console.log("Inputs saved!!");
        }
      });
		}, function () {
			console.info('Modal dismissed at: ' + new Date());
		});
	};

	/*********************
	 ** ADDING ENTITIES **
	 *********************/

	$scope.addGroup = function() {
		$scope.$emit("addGroupEmit");
	};

	$scope.addSprite = function() {
		$scope.$emit("addSpriteEmit");
	};

	$scope.addTileSprite = function() {
		$scope.$emit("addTileSpriteEmit");
	};

	$scope.addButton = function() {
		$scope.$emit("addButtonEmit");
	};

	$scope.addText = function() {
		$scope.$emit("addTextEmit");
	};

	$scope.addBitmapText = function() {
		$scope.$emit("addBitmapTextEmit");
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

	/******************
	** LEVEL DEFAULT **
	******************/

	$scope.levelDefault = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/level_default.html',
			controller: LevelDefaultCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
			// nothing to do
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