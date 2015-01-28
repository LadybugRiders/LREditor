"use strict";

var NetworkAPIManager = function(_$http,_$scope){	
	this.$http = _$http;
	this.$scope = _$scope;
}

//Init the API. The promise is called when the API is ready to be used
NetworkAPIManager.prototype.initAPI = function(_data){

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