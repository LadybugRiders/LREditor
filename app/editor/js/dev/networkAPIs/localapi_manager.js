"use strict";

var LocalAPIManager = function(_$http,_$scope){
  NetworkAPIManager.call(this,_$http,_$scope);
}

LocalAPIManager.prototype = Object.create(NetworkAPIManager.prototype);
LocalAPIManager.prototype.constructor = LocalAPIManager;

//================================================
//              PROJECT
//================================================
LocalAPIManager.prototype.loadCurrentProjectData = function(_promise) {
	var url = "/editorserverapi/v0/project";
	url += "?name=" + this.$scope.project.file;
	url += "&path=" + this.$scope.project.path;
	//console.log(this.$scope.project.path);
	var instance = this;
	this.$http.get(url).success(function(_data) {
		instance.$scope.project.name = _data.name;
		instance.$scope.project.projectFirstLevel = _data.firstLevel;
		if(_promise){
			_promise(_data);
		}
	}).error(function(_error) {
		console.error(_error);
	});
};

//================================================
//				IMAGES
//================================================
LocalAPIManager.prototype.loadCurrentProjectImages = function(_promise){
	var instance = this;
	LR.Editor.AssetManager.GetInstance().loadImages(
		"/editorserverapi/v0/image",
		this.$scope.project.path + "/assets/images",
		function(error, data) {
			if (error) {
				console.error(_error);
			} else {
    			instance.$scope.project.assets.images = instance.$scope.project.assets.images.concat(data.images);
				if(_promise){
					_promise(instance.$scope.project.assets.images);
				}
			}
		}
	);
}

//================================================
//				ATLASES
//================================================
LocalAPIManager.prototype.loadCurrentProjectAtlases = function(_promise) {
	var url = "/editorserverapi/v0/atlas";
	url += "?path=" + this.$scope.project.path + "/assets/atlases";
	var instance = this;
	this.$http.get(url).success(function(_data) {
		instance.$scope.project.assets.atlases = _data.atlases;
		if(_promise)
			_promise(_data);
	}).error(function(_error) {
		instance.$scope.atlases = new Object();
		console.error(_error);
	});
};

//================================================
//				AUDIOS
//================================================
LocalAPIManager.prototype.loadCurrentProjectAudios = function(_promise) {
	var url = "/editorserverapi/v0/audio";
	url += "?path=" + this.$scope.project.path + "/assets/audios";
	var instance = this;
	this.$http.get(url).success(function(_data) {
		instance.$scope.project.assets.audios = _data.audios;
		if(_promise)
			_promise(_data)
	}).error(function(_error) {
		instance.$scope.audios = new Object();
		console.error(_error);
	});
};

//================================================
//				LAYERS
//================================================
LocalAPIManager.prototype.loadCurrentProjectLayers = function(_promise) {
	var url = "/editorserverapi/v0/layers";
	url += "?name=layers.json";
	url += "&path=" + this.$scope.project.path + "/assets/physics";
	var instance = this;
	this.$http.get(url).success(function(_data) {
		instance.$scope.project.assets.layers = _data;
		if(_promise)
			_promise(_data);
	}).error(function(_error) {
		instance.$scope.layers = new Object();
		console.error(_error);
	});
}

//================================================
//				BEHAVIOURS
//================================================

LocalAPIManager.prototype.loadCurrentProjectBehaviours = function(_promise) {
	var url = "/editorserverapi/v0/behaviour";
	url += "?path=" + this.$scope.project.path + "/assets/behaviours";
	var instance = this;
	this.$http.get(url).success(function(_data) {
		instance.$scope.project.assets.behaviours = _data.behaviours;
		instance.loadCommonLRBehaviours(_promise);
	}).error(function(_error) {
		instance.$scope.behaviours = new Object();
		console.error(_error);
	});
}

//loads LR built in behaviours
LocalAPIManager.prototype.loadCommonLRBehaviours = function(_promise){
	var url = "/editorserverapi/v0/behaviour";
	url += "?path=" + this.$scope.project.path + "/../shared/js/dev/phaser/behaviour/common";
	var instance= this;
	this.$http.get(url).success(function(_data) {
		instance.$scope.project.assets.behaviours= instance.$scope.project.assets.behaviours.concat( _data.behaviours );
		if(_promise)
			_promise(_data);
	}).error(function(_error) {
		instance.$scope.behaviours = new Object();
		console.error(_error);
	});
}

//================================================
//				PREFABS
//================================================

LocalAPIManager.prototype.loadCurrentProjectPrefabs = function(_promise) {
	var url = "/editorserverapi/v0/prefab";
	url += "?path=" + this.$scope.project.path + "/assets/prefabs";
	var instance = this;
	this.$http.get(url).success(function(_data) {
		instance.$scope.project.assets.prefabs = _data.prefabs;
		if(_promise)
			_promise(_data);
	}).error(function(_error) {
		instance.$scope.project.assets.prefabs = new Array();
		console.error(_error);
	});
};


//================================================
//				FONTS
//================================================

LocalAPIManager.prototype.loadCurrentProjectFonts = function(_promise) {
	var url = "/editorserverapi/v0/bitmapfont";
	url += "?path=" + this.$scope.project.path + "/assets/fonts";
	var instance = this;
	this.$http.get(url).success(function(_data) {
		instance.$scope.project.assets.bitmapFonts = _data.fonts;
		if(_promise)
			_promise(_data);
	}).error(function(_error) {
		instance.$scope.project.assets.bitmapFonts = new Array();
		console.error(_error);
	});

};

//================================================
//				INPUTS
//================================================

LocalAPIManager.prototype.loadCurrentProjectInputs = function(_promise) {
	var url = "/editorserverapi/v0/inputs";
	url += "?name=inputs.json";
	url += "&path=" + this.$scope.project.path + "/assets/inputs";
	var instance = this;
	this.$http.get(url).success(function(_data) {
		instance.$scope.project.assets.inputs = _data;
		if(_promise)
			_promise(_data);
	}).error(function(_error) {
		instance.$scope.project.assets.inputs = new Object();
		console.error(_error);
	});
}

//================================================
//				LEVELS
//================================================

LocalAPIManager.prototype.loadCurrentProjectLevels = function(_promise) {
	var url = "/editorserverapi/v0/level";
	url += "?path=" + this.$scope.project.path + "/assets/levels";
	
	var instance = this;
	this.$http.get(url).success(function(_data) {
		instance.$scope.project.assets.levels = JSON.parse(JSON.stringify(_data.levels));
		
		// get level short paths
		for( var i=0; i < instance.$scope.project.assets.levels.length; i++ ){
			var level = instance.$scope.project.assets.levels[i];
			var shortPath = level.path.substring(1);
			var extIndex = shortPath.indexOf(".json");
			if( extIndex >= 0){
				shortPath = shortPath.substring(0,extIndex);
			}
			level.shortPath = shortPath;
		}
		_promise();
	}).error(function(_error) {
		instance.$scope.project.assets.levels = new Array();
		console.error(_error);
	});

};

LocalAPIManager.prototype.getProjectPath = function(){
}

LocalAPIManager.prototype.getImagesFullPath = function(){

}