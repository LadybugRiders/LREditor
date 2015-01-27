"use strict";

var GithubAPIManager = function(_$http,_$scope){
  NetworkAPIManager.call(this,_$http,_$scope);
  this.api = "github";
	//user strings
	this.userName = "LadybugRiders";
	this.currentRepoName = "kimisrescue";
	this.branchName = "dev";

  //Objects received from git describing the folder data
  this.currentRepoData = null;
  this.currentImageData = null;

  // paths
	this.userUrl = "https://api.github.com/users/"+this.userName+"/";
	this.imagesFolderPath = "assets/images";   
	this.rawRepoUrl = "https://raw.githubusercontent.com/"+this.userName+"/"
						+this.currentRepoName+"/"+this.branchName+"/";  
 

	this.getRepositoryData(this.onRepoFound);
}

NetworkAPIManager.prototype = Object.create(NetworkAPIManager.prototype);
NetworkAPIManager.prototype.constructor = GithubAPIManager;

//============================================================
//					CALLBACKS
//============================================================
//called as a promise when repository found
GithubAPIManager.prototype.onRepoFound = function(_repoData){
  this.currentRepoData = _repoData;
  //find images folder and load images
  this.findTreePathByString(_repoData.tree,	this.imagesFolderPath, this.onImagesFolderFound);
}

//called as a promise when images folder found
//Loads images into the project.assets data structure
GithubAPIManager.prototype.onImagesFolderFound = function(_imagesFolder){
  this.currentImageData = _imagesFolder;
  this.loadCurrentProjectImages(this.onImagesLoaded);
}

GithubAPIManager.prototype.onImagesLoaded = function(){
  console.log(this.project.assets.images.length);
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

GithubAPIManager.prototype.processRepositories = function(_json){
   for(var i=0; i < _json.length; i++){
	    console.log(_json[i].url);
	}
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
GithubAPIManager.prototype.loadCurrentProjectData = function() {
  var url = "/editorserverapi/v0/project";
  url += "?name=" + this.$scope.project.file;
  url += "&path=" + "/kimisrescue";//this.$scope.project.path;

  var instance = this;
  this.$http.get(url).success(function(_data) {
    instance.$scope.project.name = _data.name;
    instance.$scope.project.projectFirstLevel = _data.firstLevel;
    console.log(instance.$scope.project);

    $timeout(function() {
      instance.$scope.$emit("sendProjectEmit", {project: instance.$scope.project});
    }, 100);

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
          "/"+this.currentRepoName+"/git/trees/"+this.currentImageData.sha+"?recursive=1";
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
            console.log(_data);
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