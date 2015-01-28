"use strict";

var GithubAPIManager = function(_$http,_$scope){
  NetworkAPIManager.call(this,_$http,_$scope);
  this.api = "github";
	//user strings
	this.userName = "LadybugRiders";
	this.currentRepoName = "kimisrescue";
	this.branchName = "dev";

  this.onReadyPromise = null;

  //Current Repository git data
  this.currentRepoData = null;
  //Objects received from git describing the folder data
  this.foldersData = {};

  // paths
	this.userUrl = "https://api.github.com/users/"+this.userName+"/";
	this.imagesFolderPath = "assets/images";  
	this.rawRepoUrl = "https://raw.githubusercontent.com/"+this.userName+"/"
						+this.currentRepoName+"/"+this.branchName+"/";  
 
}

GithubAPIManager.prototype = Object.create(NetworkAPIManager.prototype);
GithubAPIManager.prototype.constructor = GithubAPIManager;

//Initialize the API. The promise is called when the API is ready to be used
GithubAPIManager.prototype.initAPI = function(_localStorage,_promise){
  var path = _localStorage.getItem("project.path");
  var file = _localStorage.getItem("project.file");
  if (path && file) {
    console.log(path);
    this.$scope.project.path = path;
    this.$scope.project.file = file;
  }
  this.onReadyPromise = _promise;
  this.getRepositoryData(this.onRepoFound);
}

//============================================================
//					CALLBACKS
//============================================================
//called as a promise when repository found
GithubAPIManager.prototype.onRepoFound = function(_repoData){
  this.currentRepoData = _repoData;
  this.reposCount = 2; 

  //find images folder and load images
  this.findTreePathByString(_repoData.tree,	"assets/images", this.onImagesFolderFound);
  this.findTreePathByString(_repoData.tree, "assets/atlases", this.onAtlasesFolderFound);
}

//called as a promise when images folder found
//Loads images into the project.assets data structure
GithubAPIManager.prototype.onImagesFolderFound = function(_imagesFolder){
  this.foldersData.images = _imagesFolder;
  this.checkReadiness();
}

//called as a promise when images folder found
//Loads images into the project.assets data structure
GithubAPIManager.prototype.onAtlasesFolderFound = function(_atlasesFolder){
  this.foldersData.atlases = _atlasesFolder;
  this.checkReadiness();
}

GithubAPIManager.prototype.checkReadiness = function(){ 
  console.log(this.reposCount);
  this.reposCount --; 
  //once ready
  if(this.reposCount<=0 && this.onReadyPromise != null ){
    this.onReadyPromise();
    this.onReadyPromise = null;
  }
}

//============================================================
//					CALLS
//============================================================
//List Repositories for a specified user
GithubAPIManager.prototype.getRepositories = function(_promise){
  var userUrl = "https://api.github.com/users/"+_userName+"/";
  var reposUrl = userUrl+"repos";

  this.$http(reposUrl)
  	.success(
  		function(_data){
			if( _promise != null )
		  		_promise(_data);
		}
  	)
  	.error(
  	);
}

//List images of the master branch
GithubAPIManager.prototype.getRepositoryData = function(_promise){
  var url = "https://api.github.com/repos/"+this.userName+
  				"/"+this.currentRepoName+"/git/trees/"+this.branchName;
  var instance = this;
  //request object
  var req = {
	 method: 'GET',
	 url: url,
	 headers: {
	   'Content-Type': undefined
	 }
	};
  this.$http(req)
  			.success(
  				function(_data, _status, _headers, _config) {
			        if(_promise != null)
			          	_promise.call(instance,_data);
  				}
  			)
  			.error(
  				function(_data, _status, _headers, _config){
  					console.log( "error : " + _status);
  				}
  			)
}

//================================================
//              PROJECT
//================================================
GithubAPIManager.prototype.loadCurrentProjectData = function(_promise) {
  var url = "/editorserverapi/v0/project";
  url += "?name=" + this.$scope.project.file;
  url += "&path=" + "/kimisrescue";//this.$scope.project.path;

  var instance = this;
  this.$http.get(url).success(function(_data) {
    instance.$scope.project.name = _data.name;
    instance.$scope.project.projectFirstLevel = _data.firstLevel;
    if(_promise)
        _promise(_data);

  }).error(function(_error) {
    console.error(_error);
  });
};

//================================================
//				IMAGES
//================================================

Image.EXTENTIONS_FILTER = /.(png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF)/i;

GithubAPIManager.prototype.loadCurrentProjectImages = function(_promise){
  var url = "https://api.github.com/repos/"+this.userName+
          "/"+this.currentRepoName+"/git/trees/"+this.foldersData.images.sha+"?recursive=1";
  var instance = this;
  //request object
  var req = {
   method: 'GET',
   url: url,
   headers: {
     'Content-Type': undefined
   }
  };
  //Send request to get the image folder recursively
  this.$http(req)
        .success(
          function(_data, _status, _headers, _config) {
            //console.log(_data);
            instance.getImages(_data.tree);
            //get Images for the tree data and stores them in assets
              if(_promise != null)
                  _promise.call(instance,_data);
          }
        )
        .error(
          function(_data, _status, _headers, _config){
            console.log( "error : " + _status);
          }
        )
}

//Get all Images in the folder and store them
GithubAPIManager.prototype.getImages = function(_imagesTree){
  for(var i=0; i < _imagesTree.length; i++){
    var gitData = _imagesTree[i];
    if( gitData == null)
      return;
    //console.log(gitData);
    //if it's a file
    if(gitData.type == "blob"){
      //____get simple image name____
      var imageName = "/"+gitData.path;
      //get extension
      var extension = imageName.substr(imageName.lastIndexOf("."));
      if(Image.EXTENTIONS_FILTER.test(extension)){
        //process image name
        imageName = imageName.substr(0,imageName.lastIndexOf(".")); // remove extension
        imageName = imageName.substr(1); // remove first "/"
        imageName = imageName.replace(/\//g, "-"); // replace "/" by "-"
        //build image url
        var imageUrl = "/"+gitData.path;
        this.$scope.project.assets.images.push( {"path":imageUrl, "name":imageName});
      }
    }
  }
}


//================================================
//        ATLASES
//================================================
GithubAPIManager.prototype.loadCurrentProjectAtlases = function(_promise) {
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
//        AUDIOS
//================================================
GithubAPIManager.prototype.loadCurrentProjectAudios = function(_promise) {
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
//        LAYERS
//================================================
GithubAPIManager.prototype.loadCurrentProjectLayers = function(_promise) {
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
//        BEHAVIOURS
//================================================

GithubAPIManager.prototype.loadCurrentProjectBehaviours = function(_promise) {
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
GithubAPIManager.prototype.loadCommonLRBehaviours = function(_promise){
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
//        PREFABS
//================================================

GithubAPIManager.prototype.loadCurrentProjectPrefabs = function(_promise) {
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
//        FONTS
//================================================

GithubAPIManager.prototype.loadCurrentProjectFonts = function(_promise) {
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
//        INPUTS
//================================================

GithubAPIManager.prototype.loadCurrentProjectInputs = function(_promise) {
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
//        LEVELS
//================================================

GithubAPIManager.prototype.loadCurrentProjectLevels = function(_promise) {
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


//================================================
//		GIT TREE NAVIGATION
//================================================

//go in the git tree to find the specified path
GithubAPIManager.prototype.findTreePathByString = function(_gitTree,_stringPath,_promise){
  //split the path by "/"
  var splitPath = _stringPath.split('/');
  //try to find the first (or only) path in the git tree
  var treePathObject = null;
  	for( var i=0; i < _gitTree.length; i++){
    	if( _gitTree[i].path == splitPath[0]){
      		treePathObject = _gitTree[i];
      		break;
    	}
  	}

  	// return if no folder/file was found
  	if( treePathObject == null)
    	return;

	var instance = this;
 	//get the folder git data
  	this.$http.get(treePathObject.url)
  			.success(
  				function(_data, _status, _headers, _config){
			        //when the complete path has been processed
			        if( splitPath.length <= 1){
			          if( _promise != null)
			            _promise.call(instance,_data);
			        //else continue going deeper in the hierarchy
			        }else{
			          instance.findTreePathByString(_data.tree,splitPath.slice(1).join("/"),_promise);
			        }
			    }
  			)
  			.error(
  				function(_data, _status, _headers, _config){
			        console.log(_error);
			    }
  			);
}

//========================================================
//				GETTERS / SETTERS
//========================================================

GithubAPIManager.prototype.setUserName = function(_userName){
	this.userName = _userName;
	this.rawRepoUrl = "https://raw.githubusercontent.com/"+this.userName+"/"
						+this.currentRepoName+"/"+this.branchName+"/";  
}


GithubAPIManager.prototype.setRepoName = function(_repositoryName){
	this.currentRepoName = _repositoryName;
}

GithubAPIManager.prototype.getProjectPath = function(){
  return this.rawRepoUrl;
}

GithubAPIManager.prototype.getImagesFullPath = function(){
	return this.rawRepoUrl+this.imagesFolderPath;
}