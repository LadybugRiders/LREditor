"use strict";

var NetworkAPIManager = function(_$http,_$scope){	
	this.$http = _$http;
	this.$scope = _$scope;
	//project data initializing
	this.project = { "assets":{"images":[], "behaviours":[],
								"levels":[], "layers":{},
								"audios":{}, "prefabs" : [],
								"inputs":{}, "bitmapFonts":[],
								"atlases":[] 
							}
					};  
}

NetworkAPIManager.prototype.loadCurrentProjectData = function(_promise){};

NetworkAPIManager.prototype.loadCurrentProjectImages = function(_promise){};

NetworkAPIManager.prototype.loadCurrentProjectAtlases = function(_promise){};

NetworkAPIManager.prototype.loadCurrentProjectAudios = function(_promise) {};

NetworkAPIManager.prototype.loadCurrentProjectLayers = function(_promise){};

NetworkAPIManager.prototype.loadCurrentProjectBehaviours = function(_promise){};

NetworkAPIManager.prototype.loadCommonLRBehaviours = function(_promise){}

NetworkAPIManager.prototype.loadCurrentProjectPrefabs = function(_promise){}

NetworkAPIManager.prototype.loadCurrentProjectFonts = function(_promise){}

NetworkAPIManager.prototype.getProjectPath = function(){
}

NetworkAPIManager.prototype.getImagesFullPath = function(){
}