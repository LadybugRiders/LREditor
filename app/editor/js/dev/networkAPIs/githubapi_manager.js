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
  this.assetsFolderNames = ["images","atlases","audios","physics","prefabs"]

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
  this.reposCount = 0; 
  this.currentSearchAssetIndex = 0;

  //find first asset folder
  this.findTreePathByString(_repoData.tree,	"assets/"+this.assetsFolderNames[0], this.onCurrentAssetFolderFound);
}

//called each time an asset folder is found
GithubAPIManager.prototype.onCurrentAssetFolderFound = function(_assetFolder){
  var assetName = this.assetsFolderNames[this.currentSearchAssetIndex];
  console.log("Folder /"+assetName+ " found");
  this.foldersData[assetName] = _assetFolder;
  this.currentSearchAssetIndex ++;
  //Search for next assets folder
  if(this.currentSearchAssetIndex < this.assetsFolderNames.length){
      this.findTreePathByString(this.currentRepoData.tree, 
                              "assets/"+this.assetsFolderNames[this.currentSearchAssetIndex],
                               this.onCurrentAssetFolderFound);
  }else{    
    //when no other asset folder is to be found
    console.log("allAssetsFound");
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

var IMAGES_EXTENTIONS_FILTER = /.(png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF)/i;

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
        );
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
      if(IMAGES_EXTENTIONS_FILTER.test(extension)){
        //process image name
        imageName = this.processPathToName(imageName);
        //build image url
        var imageUrl = "/"+gitData.path;
        //build data
        var imgData = {"path":imageUrl, "name":imageName};
        imgData.sha = gitData.sha;
        //push it in images
        this.$scope.project.assets.images.push( imgData );
      }
    }
  }
}

//================================================
//        ATLASES
//================================================
GithubAPIManager.prototype.loadCurrentProjectAtlases = function(_promise) {
  var url = "https://api.github.com/repos/"+this.userName+
          "/"+this.currentRepoName+"/git/trees/"+this.foldersData.atlases.sha+"?recursive=1";
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
            instance.getAtlases(_data.tree);
            //get Images for the tree data and stores them in assets
              if(_promise != null)
                  _promise.call(instance,_data);
          }
        )
        .error(
          function(_data, _status, _headers, _config){
            console.log( "error : " + _status);
          }
        );
};

//Get all atlases in the folder and store them
GithubAPIManager.prototype.getAtlases = function(_atlasTree){

  for(var i=0; i < _atlasTree.length; i++){
    var gitData = _atlasTree[i];
    if( gitData == null)
      return;
  
    //if it's a file
    if(gitData.type == "blob"){
      /********/
      // we have to way of creating a new atlas data: 
      //    we can fand either the image or the json first
      /********/

      //____get simple image name____
      var imageName = "/"+gitData.path;
      //get extension for IMAGES
      var extension = imageName.substr(imageName.lastIndexOf("."));
      //if it's an image
      if(IMAGES_EXTENTIONS_FILTER.test(extension)){
        //process image name
        imageName = this.processPathToName(imageName);
        //build image url
        var imageUrl = "/"+gitData.path;
        //build data
        var atlasData = this.findOrCreateAtlasData(imageName);
        atlasData.path = imageUrl.substr(0,imageUrl.lastIndexOf("."));;
        atlasData.imageSha = gitData.sha;
      }
      //TEST JSON
      else{
        var extJson = /.(json|JSON)/i.test(extension);
        if(extJson){
          var jsonName = this.processPathToName(imageName)
          var atlasData = this.findOrCreateAtlasData(jsonName);
          atlasData.jsonSha = gitData.sha;
        }
      }
    }
  }
}

//find an existing atlas if previously created. Create a new one if not.
GithubAPIManager.prototype.findOrCreateAtlasData = function(_name){
    var atlases = this.$scope.project.assets.atlases;
    //find existing
    for(var i=0; i < atlases.length; i++){
      if(atlases[i].name == _name){
        return atlases[i];
      }
    }
    //create
    var imgData = {"name":_name};
    atlases.push( imgData );
    return atlases[atlases.length-1];
  }

//================================================
//        AUDIOS
//================================================
var AUDIOS_EXTENTIONS_FILTER = /.(ogg|OGG|wav|WAV|mp3|MP3)/i;

GithubAPIManager.prototype.loadCurrentProjectAudios = function(_promise) {
  if(this.foldersData.audios == null){
    if(_promise != null)
      _promise.call(this,_data);
    return;
  }
  var url = "https://api.github.com/repos/"+this.userName+
          "/"+this.currentRepoName+"/git/trees/"+this.foldersData.audios.sha+"?recursive=1";
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
            instance.getAudios(_data.tree);
            //get Images for the tree data and stores them in assets
              if(_promise != null)
                  _promise.call(instance,_data);
          }
        )
        .error(
          function(_data, _status, _headers, _config){
            console.log( "error : " + _status);
          }
        );
};

//Get all Audios in the folder and store them
GithubAPIManager.prototype.getAudios = function(_audioTree){

  for(var i=0; i < _audioTree.length; i++){
    var gitData = _audioTree[i];
    if( gitData == null)
      return;

    //if it's a file
    if(gitData.type == "blob"){
      //____get simple image name____
      var audioName = "/"+gitData.path;
      //get extension
      var extension = audioName.substr(audioName.lastIndexOf("."));
      if(AUDIOS_EXTENTIONS_FILTER.test(extension)){
        //process image name
        audioName = this.processPathToName(audioName,false);
        //build image url
        var audioUrl = "/"+gitData.path;
        //build data
        var audioData = {"path":audioUrl, "name":audioName};
        audioData.sha = gitData.sha;
        //push it in images
        this.$scope.project.assets.audios.push( audioData );
      }
    }
  }
}

//================================================
//        LAYERS
//================================================
GithubAPIManager.prototype.loadCurrentProjectLayers = function(_promise) {
  if(this.foldersData.physics == null){
    if(_promise != null)
      _promise.call(this,_data);
    return;
  }
  var url = "https://api.github.com/repos/"+this.userName+
          "/"+this.currentRepoName+"/git/trees/"+this.foldersData.physics.sha+"?recursive=1";
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
            instance.getLayers(_data.tree,_promise);
          }
        )
        .error(
          function(_data, _status, _headers, _config){
            console.log( "error : " + _status);
          }
        );
}

GithubAPIManager.prototype.getLayers = function(_physicsTree,_promise) {
  for(var i=0; i < _physicsTree.length; i++){
    var gitData = _physicsTree[i];
    if( gitData == null)
      return;
    if( gitData.path == "layers.json"){
      //try loading the layers file
      var url = "https://api.github.com/repos/"+this.userName+
          "/"+this.currentRepoName+"/git/blobs/"+gitData.sha;
      var instance = this;
      //request object
      var req = {
       method: 'GET',
       url: url,
       headers: {
          'Accept': 'application/vnd.github-blob.raw',
          'Content-Type': undefined
       }
      };
      //Send request to get the image folder recursively
      this.$http(req)
            .success(
              function(_data, _status, _headers, _config) {
                instance.$scope.project.assets.layers = _data;
                //get Images for the tree data and stores them in assets
                  if(_promise != null)
                      _promise.call(instance,_data);
              }
            )
            .error(
              function(_data, _status, _headers, _config){
                console.log( "error : " + _status);
              }
            );
    }
  }
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
  if(this.foldersData.prefabs == null){
    if(_promise != null)
      _promise.call(this,_data);
    return;
  }
  var url = "https://api.github.com/repos/"+this.userName+
          "/"+this.currentRepoName+"/git/trees/"+this.foldersData.prefabs.sha+"?recursive=1";
  var instance = this;
  //request object
  var req = {
   method: 'GET',
   url: url,
   headers: {
     'Content-Type': "application/json"
   }
  };
  //Send request to get the image folder recursively
  this.$http(req)
        .success(
          function(_data, _status, _headers, _config) {
            instance.getPrefabs(_data.tree);
            //get Images for the tree data and stores them in assets
              if(_promise != null)
                  _promise.call(instance,_data);
          }
        )
        .error(
          function(_data, _status, _headers, _config){
            console.log( "error : " + _status);
          }
        );
};

//Get all prefabs in the folder and store them
GithubAPIManager.prototype.getPrefabs = function(_prefabsTree){

  for(var i=0; i < _prefabsTree.length; i++){
    var gitData = _prefabsTree[i];
    if( gitData == null)
      return;

    //if it's a file
    if(gitData.type == "blob"){
      //____get simple image name____
      var prefabName = "/"+gitData.path;
      //get extension
      var extension = prefabName.substr(prefabName.lastIndexOf("."));
      if(/.(json)/i.test(extension)){
        //process image name
        prefabName = this.processPathToName(prefabName);
        //build image url
        var prefabUrl = "/"+gitData.path;
        //build data
        var prefabData = {"path":prefabUrl, "name":prefabName};
        prefabData.sha = gitData.sha;
        //push it in images
        this.$scope.project.assets.prefabs.push( prefabData );
      }
    }
  }
}

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
//		 UTILS
//================================================

GithubAPIManager.prototype.processPathToName = function(_stringPath,_removeExtension){
  var str = _stringPath;
  if( _removeExtension != false )
    str = str.substr(0,str.lastIndexOf(".")); // remove extension
  str = str.substr(1); // remove first "/"
  str = str.replace(/\//g, "-"); // replace "/" by "-"
  return str;
}

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