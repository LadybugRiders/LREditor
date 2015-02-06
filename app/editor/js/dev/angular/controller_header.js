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

		$scope.$on("sendAtlasesBroadcast", function(_event, _args) {
			if (_args.atlases) {
				$scope.atlases = _args.atlases;
			}
		});

		$scope.$on("importCutsceneBroadcast", function(_event, _args) {
			$scope.importCutscene();
		});

		$scope.$on("openEditModalBroadcast", function(_event, _args) {
			$scope.openEditModal(_args.context,_args.varName,_args.isLong);
		});

		$scope.$on("openPrefabsModalBroadcast", function(_event, _args) {
			$scope.managePrefabs();
		});

		$scope.$on("sendCutscenesBroadcast", function(_event, _args) {
			$scope.setCutscenes(_args.cutscenes);
		});

		$scope.$on("refreshCurrentEntityBroadcast", function(_event, _args) {
			$scope.currentEntity = _args.entity;
		});

		//Receive settings from phaser when importing
		$scope.$on("sendSettingsBroadcast", function(_event, _args) {
			$scope.project.settings = jQuery.extend(true, {}, _args);
			$scope.modalSettingsData = jQuery.extend(true, {}, _args);
		});
		//When settings are modified in the modal
		$scope.$on("saveSettingsBroadcast", function(_event, _args) {
			$scope.project.settings = jQuery.extend(true, {}, _args);
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
		$scope.project.assets.audios = new Array();
		$scope.project.assets.layers = new Object();
		$scope.project.assets.behaviours = new Array();
		$scope.project.assets.prefabs = new Array();
		$scope.project.assets.inputs = new Object();
		$scope.project.assets.bitmapFonts = new Array();
		$scope.project.assets.atlases = new Array();

		$scope.project.settings = {
			world :{},
			camera : { x:0,y:0,width : 640, height : 340},
			ed_camera :{x : 0, y : 0},
			debugBodiesInGame : false
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

		$scope.modalLayersData = { layers : {} };
		$scope.modalInputsData = { inputs : {} };

		//Create Network API and change porject path
		//$scope.networkAPI = new LocalAPIManager($http,$scope); 
		$scope.networkAPI = new GithubAPIManager($http,$scope);

		// load current project data
		if (localStorage) {			
			$scope.networkAPI.initAPI(localStorage,true,$scope.onNetworkAPIReady);
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

	//promise called when the network API is ready to use
	$scope.onNetworkAPIReady = function(){
		$scope.currentLoadingAsset = "project";
		$scope.networkAPI.loadCurrentProjectData($scope.onProjectLoaded);
	}

	//Each time an assets set (images, audios...) is fully loaded
	$scope.onAssetLoaded = function(){
		if( $scope.assetsToLoad.length > 0){
			var loadedAssetName = this.currentLoadingAsset;
			//get asset to load and remove it from the stack
			$scope.currentLoadingAsset = $scope.assetsToLoad[0];
			$scope.assetsToLoad.splice(0,1);
			$scope.$emit("assetLoadedEmit",{"loadedAssetName": loadedAssetName, "nextAssetName":this.currentLoadingAsset});
			//load the next assets
			switch($scope.currentLoadingAsset){				
			    case "images" : $scope.networkAPI.loadCurrentProjectImages($scope.onImagesLoaded);
			    	break;
			    case "prefabs" : $scope.networkAPI.loadCurrentProjectPrefabs($scope.onPrefabsLoaded);
			    	break;
			    case "atlases" : $scope.networkAPI.loadCurrentProjectAtlases($scope.onAtlasesLoaded);
			    	break;
			    case "audios" : $scope.networkAPI.loadCurrentProjectAudios($scope.onAudioLoaded);
			    	break;
			    case "behaviours" : $scope.networkAPI.loadCurrentProjectBehaviours($scope.onBehavioursLoaded);
			    	break;
			    case "inputs" : $scope.networkAPI.loadCurrentProjectInputs($scope.onInputsLoaded);
			    	break;
			    case "layers" : $scope.networkAPI.loadCurrentProjectLayers($scope.onLayersLoaded);
			    	break;
			    case "fonts" : $scope.networkAPI.loadCurrentProjectFonts($scope.onFontsLoaded);
			    	break;
			    case "levels" : $scope.networkAPI.loadCurrentProjectLevels($scope.onLevelsLoaded);
					break;
			}
		}else{
			console.log("ALL_ASSETS_LOADED");
			$scope.$emit("allAssetsLoadedEmit",{});
		}
	}

	/************
	** PROJECT **
	************/	

	$scope.onProjectLoaded = function(_data){	
		$timeout(function() {
			$scope.$emit("sendProjectEmit", {project: $scope.project});

			$scope.assetsToLoad = ["prefabs","atlases","audios","inputs",
								"layers","fonts","levels","behaviours"];
			$scope.currentLoadingAsset = "images";

			//load images first.
			//the other assets will come next in onAssetLoaded() function
		    $scope.networkAPI.loadCurrentProjectImages($scope.onImagesLoaded);
			}, 100);
	}

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
	$scope.onImagesLoaded = function(_data){
		//console.log("ImagesLoaded");
		$scope.onAssetLoaded();
		$scope.$emit("sendImagesEmit", {images: $scope.project.assets.images});
		//parse names to find frames sizes
		var images = $scope.project.assets.images;
        for(var i=0; i < images.length; i++){
            if( images[i].frameWidth != null )
                continue;
            var imageName = images[i].path;
            var regex = /[0-9]+x[0-9]+/.exec(imageName);
            if( regex ){
                var aFrame = regex[0].split("x");
                images[i].frameWidth = parseInt(aFrame[0]);
                images[i].frameHeight = parseInt(aFrame[1]);
            }
        }
	}

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

	/************
	** ATLASES **
	************/

	$scope.onAtlasesLoaded = function(_data) {
		//console.log("AtlasesLoaded");
		$scope.onAssetLoaded();
		$scope.$emit("sendAtlasesEmit", {atlases: $scope.project.assets.atlases});		
	};

	$scope.manageAtlases = function() {
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/atlases.html',
			controller: AtlasesCtrlModal,
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

	$scope.onAudioLoaded = function() {
		//console.log("AudioLoaded");
		$scope.onAssetLoaded();
		$scope.$emit("sendAudiosEmit", {audios: $scope.project.assets.audios});
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
	$scope.onLayersLoaded = function(_data) {
		//console.log('LayersLoaded')
		$scope.onAssetLoaded();
		$scope.$emit("sendLayersEmit", {"layers": $scope.project.assets.layers });
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

	//loads LR built in behaviours
	$scope.onBehavioursLoaded = function(){
		//console.log("BehavioursLoaded");
		$scope.onAssetLoaded();
		$scope.$emit("sendBehavioursEmit", {behaviours: $scope.project.assets.behaviours});
	}

	$scope.manageBehaviours = function() {
		// nothing to do
	};

	/************
	** PREFABS **
	************/

	$scope.onPrefabsLoaded = function(_data) {
		//console.log("PrefabsLoaded");
		$scope.onAssetLoaded();
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

	$scope.onFontsLoaded = function() {
		//console.log("FontsLoaded");
		$scope.onAssetLoaded();
		$scope.$emit("sendBitmapFontsEmit",{bitmapFonts : $scope.project.assets.bitmapFonts});
	};

	/***********
	** LEVELS **
	***********/

	$scope.onLevelsLoaded = function() {
		//console.log("LevelsLoaded");
		$scope.onAssetLoaded();
	};

	/***********
	** INPUTS **
	***********/

	$scope.onInputsLoaded = function(_data) {
		//console.log("InputsLoaded");
		$scope.onAssetLoaded();
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
	//Save the current Level
	$scope.levelSave = function() {
		var data = {
	      levelName: $scope.project.level.substring(1),
	      levelPath: $scope.project.path + "/assets/levels",
	      levelStorage: "file"
	    };
		$scope.$emit("exportLevelEmit", data);
	};

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