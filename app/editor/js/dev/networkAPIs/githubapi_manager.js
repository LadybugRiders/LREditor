"use strict";

var GithubAPIManager = function(_$http,_$scope){
  NetworkAPIManager.call(this,_$http,_$scope);
  this.api = "github";
	//user strings
	this.userName = "LadybugRiders";
	this.currentRepoName = "";
	this.branchName = "";

  //tells if the user name is valid
  this.userCheck = false;
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
GithubAPIManager.prototype.initAPI = function(_localStorage,_checkStorage,_promise){
  this.localStorage = _localStorage;
  var path = _localStorage.getItem("project.path");
  var file = _localStorage.getItem("project.file");
  if (path && file) {
    this.$scope.project.path = path;
    this.$scope.project.file = file;
  }
  this.onReadyPromise = _promise;

  //Get Local Storage user ids
  if( _checkStorage){
    var userName = this.localStorage.getItem("github_user_name");
    var repoName = this.localStorage.getItem("github_repo_name");
    var branchName = this.localStorage.getItem("github_branch_name");

    if( userName ) this.userName = userName;
    if( repoName ) this.currentRepoName = repoName;
    if( branchName ) this.branchName = branchName;
  }

  //
  if(isStringValid(this.userName) && isStringValid(this.currentRepoName)){
    this.getRepositories();
    this.getBranches();
    this.getRepositoryData();
  }
}

GithubAPIManager.prototype.saveIDs = function(){
  //console.log("save github ids" + this.userName + " " + this.currentRepoName + " " + this.branchName);
  this.localStorage.setItem("github_user_name", this.userName);
  this.localStorage.setItem("github_repo_name", this.currentRepoName);
  this.localStorage.setItem("github_branch_name", this.branchName);
}

//============================================================
//					CALLBACKS
//============================================================
//called as a promise when repository found
GithubAPIManager.prototype.onRepoFound = function(_repoData){

  this.saveIDs();

  this.currentRepoData = _repoData;
  this.userCheck = true;

  //search project.json file
  for(var i=0; i < _repoData.tree.length; i++){
    if(_repoData.tree[i].type == "blob" && _repoData.tree[i].path == "project.json"){
      this.projectFileData = _repoData.tree[i];
      break;
    }
  }

  //find asset folder
  this.findTreePathByString(_repoData.tree,	
                            "assets", 
                            this.onCurrentAssetFolderFound);
}

//called when the asset folder is found
GithubAPIManager.prototype.onCurrentAssetFolderFound = function(_assetFolder){

  for(var i=0; i < _assetFolder.tree.length; i++){
    if(_assetFolder.tree[i].type == "tree"){
      this.foldersData[_assetFolder.tree[i].path] = _assetFolder.tree[i];
    }
  }

  console.log("allAssetsFound");
  this.onReadyPromise();
  this.onReadyPromise = null;
}


//============================================================
//					CALLS
//============================================================
//List Repositories for a specified user
GithubAPIManager.prototype.getRepositories = function(_userName,_promise){
  if(_userName == null){
    if(this.userName != null)
      _userName = this.userName;
    else
      return;
  }
  var userUrl = "https://api.github.com/users/"+_userName+"/";
  var reposUrl = userUrl+"repos";

  var req = {
   method: 'GET',
   url: reposUrl,
   headers: {
     'Content-Type': undefined
   }
  };
  var instance = this;
  this.$http(req)
  	.success(
  		function(_data){
        instance.repositories = _data;
  			if( _promise != null )
  		  		_promise(_data);
		}
  	)
  	.error(
      function(_data){
        if( _promise != null )
            _promise({"failed": true});
      }
  	);
}

//GET current repository
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
              instance.onRepoFound(_data);
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

GithubAPIManager.prototype.getBranches = function(_userName,_repo,_promise){
  if(_userName == null){
    if(this.userName != null)
      _userName = this.userName;
    else
      return;
  }

  if(_repo == null){
    if(this.currentRepoName != null)
      _repo = this.currentRepoName;
    else
      return;
  }

  var req = {
   method: 'GET',
   url: "https://api.github.com/repos/"+_userName+"/"+ _repo +"/branches",
   headers: {
     'Content-Type': undefined
   }
  };
  var instance = this;
  this.$http(req)
    .success(
      function(_data){
        instance.branches = _data;
        if( _promise != null )
            _promise(_data);
    }
    )
    .error(
      function(_data){
        if( _promise != null )
            _promise({"failed": true});
      }
    );
}
//================================================
//              PROJECT
//================================================
GithubAPIManager.prototype.loadCurrentProjectData = function(_promise) {
  if(this.projectFileData == null){
    if(_promise)
      _promise.call(this,{'success':false});
    return;
  }
  var url = "https://api.github.com/repos/"+this.userName+
      "/"+this.currentRepoName+"/git/blobs/"+this.projectFileData.sha;
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
            instance.$scope.project.name = _data.name;
            instance.$scope.project.projectFirstLevel = _data.firstLevel;
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

//================================================
//				IMAGES
//================================================

var IMAGES_EXTENTIONS_FILTER = /.(png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF)/i;

GithubAPIManager.prototype.loadCurrentProjectImages = function(_promise){
  if(this.foldersData.images == null){
    if(_promise != null)
      _promise.call(this,{"success":false});
    return;
  }
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
  if(this.foldersData.atlases == null){
    if(_promise != null)
      _promise.call(this,{"success":false});
    return;
  }
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
      _promise.call(this,{"success":false});
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
      _promise.call(this,{"success":false});
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

var Behaviour = {};
Behaviour.KEY = "behaviour";
Behaviour.EXTENTIONS_FILTER = /.(js)/i;
Behaviour.FLAG_NAME = "//>>LREditor.Behaviour.name:";
Behaviour.FLAG_PARAMS = "//>>LREditor.Behaviour.params:";
Behaviour.FLAG_DESC = "//>>LREditor.Behaviour.desc";

GithubAPIManager.prototype.loadCurrentProjectBehaviours = function(_promise) {
  if(this.foldersData.behaviours == null){
    if(_promise != null)
      _promise.call(this,{"success":false});
    return;
  }
  var url = "https://api.github.com/repos/"+this.userName+
          "/"+this.currentRepoName+"/git/trees/"+this.foldersData.behaviours.sha+"?recursive=1";
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
            instance.getBehaviours(_data.tree,_promise);
          }
        )
        .error(
          function(_data, _status, _headers, _config){
            console.log( "error : " + _status);
          }
        );
}

GithubAPIManager.prototype.getBehaviours = function(_bhTree,_promise) {
    var gitData = _bhTree[0];
    if( gitData == null)
      return;
    
    this.loadBehavioursFromTree(_bhTree,0,_promise);
}

//loads LR built in behaviours
GithubAPIManager.prototype.loadBehavioursFromTree = function(_folderTree,_index,_promise){
  //stop condition
  if( _index >= _folderTree.length){
    if(_promise)
      _promise.call(this);
    return;
  }

  var gitData = _folderTree[_index];

  //if folder, pass
  if(gitData.type == "tree"){
    _index+=1;
    this.loadBehavioursFromTree(_folderTree,_index,_promise);
    return;
  }

  //try loading the behaviour file
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
            // get behaviour name
            var name = getBehaviourInfos(_data, Behaviour.FLAG_NAME);
            if (name == null) name = "Behaviour";
            
            // get behaviour params
            var params = getBehaviourInfos(_data, Behaviour.FLAG_PARAMS);
            if (params == null) {
              params = {};
            } else {
              try {
                params = JSON.parse(params);
              } catch(error) {
                console.warn("Error while parsing 'Behaviour.FLAG_PARAMS': " + error);
              }
            }

            var desc = getBehaviourDesc(_data);

            // add the behaviour
            instance.$scope.project.assets.behaviours.push({
              name: name,
              params: params,
              desc : desc,
              path : "/"+gitData.path
            });

            //continue loading behaviours
            _index+=1;
            instance.loadBehavioursFromTree(_folderTree,_index,_promise);
          }
        )
        .error(
          function(_data, _status, _headers, _config){
            console.log( "error : " + _status);
          }
        );
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


function getBehaviourInfos(_data, _flag) {
  var infos = null;
  var clean = _data.replace(/\r/g,"");

  // split lines
  var clean = _data.replace(/\r/g, "");
  var lines = clean.split("\n");

  var i=0;
  var found = false;
  // found the line with the right key
  while (i<lines.length && found == false) {
    var line = lines[i];
    line = line.replace(/ /g, '');

    var index = line.indexOf(_flag);
    if (index > -1) {
      infos = line.split(_flag)[1];
      found = true;
    }

    i++;
  }
  
  return infos;
}

function getBehaviourDesc(_data) {
  var infos = null;
  var clean = _data.replace(/\r/g,"");

  // split lines
  var clean = _data.replace(/\r/g, "");
  var lines = clean.split("\n");

  var i=0;
  var found = false;
  // found the line with the right key
  while (i<lines.length && found == false) {
    var line = lines[i];
    var index = line.indexOf(Behaviour.FLAG_DESC);
    if (index > -1) {
      infos = line.substring(line.indexOf(":"));
      found = true;
    }

    i++;
  }
  
  return infos;
}
//================================================
//        PREFABS
//================================================

GithubAPIManager.prototype.loadCurrentProjectPrefabs = function(_promise) {
  if(this.foldersData.prefabs == null){
    if(_promise != null)
      _promise.call(this,{"success":false});
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
var BITMAPFONTS_EXTENTIONS_FILTER = /.(png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF)/i;

GithubAPIManager.prototype.loadCurrentProjectFonts = function(_promise) {
  if(this.foldersData.fonts == null){
    if(_promise != null)
      _promise.call(this,{"success":false});
    return;
  }
  var url = "https://api.github.com/repos/"+this.userName+
          "/"+this.currentRepoName+"/git/trees/"+this.foldersData.fonts.sha+"?recursive=1";
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
            instance.getBitmapFonts(_data.tree);
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

//Get all fonts in the folder and store them
GithubAPIManager.prototype.getBitmapFonts = function(_fontsTree){

  for(var i=0; i < _fontsTree.length; i++){
    var gitData = _fontsTree[i];
    if( gitData == null)
      return;

    //if it's a file
    if(gitData.type == "blob"){
      //____get simple image name____
      var fontName = "/"+gitData.path;      
      var extension = fontName.substr(fontName.lastIndexOf("."));//get extension
      fontName = this.processPathToName(fontName);
      var fontData = this.findOrCreateBitmapFontData(fontName);

      if(BITMAPFONTS_EXTENTIONS_FILTER.test(extension)){
        //build image url
        var fontUrl = "/"+gitData.path;
        //build data
        fontData.path = fontUrl;
        fontData.sha = gitData.sha;
      //JSON
      }else if(/.(json|JSON)/i.test(extension)){
        fontData.pathJson = "/"+gitData.path;
        fontData.jsonSha = gitData.sha;
      }else if(/.(xml|XML)/i.test(extension)){
        fontData.pathData = "/"+gitData.path;
        fontData.dataSha = gitData.sha;
      }
    }
  }
}

//find an existing bitmapFonts if previously created. Create a new one if not.
GithubAPIManager.prototype.findOrCreateBitmapFontData = function(_name){
    var bitmapFonts = this.$scope.project.assets.bitmapFonts;
    //find existing
    for(var i=0; i < bitmapFonts.length; i++){
      if(bitmapFonts[i].name == _name){
        return bitmapFonts[i];
      }
    }
    //create
    var imgData = {"name":_name};
    bitmapFonts.push( imgData );
    return bitmapFonts[bitmapFonts.length-1];
  }

//================================================
//        INPUTS
//================================================

GithubAPIManager.prototype.loadCurrentProjectInputs = function(_promise) {
  if(this.foldersData.inputs == null){
    if(_promise != null)
      _promise.call(this,{"success":false});
    return;
  }
  var url = "https://api.github.com/repos/"+this.userName+
          "/"+this.currentRepoName+"/git/trees/"+this.foldersData.inputs.sha+"?recursive=1";
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
            instance.getInputs(_data.tree,_promise);
          }
        )
        .error(
          function(_data, _status, _headers, _config){
            console.log( "error : " + _status);
          }
        );
}


GithubAPIManager.prototype.getInputs = function(_inputsTree,_promise) {
  for(var i=0; i < _inputsTree.length; i++){
    var gitData = _inputsTree[i];
    if( gitData == null)
      return;
    if( gitData.path == "inputs.json"){
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
                instance.$scope.project.assets.inputs = _data;
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
//        LEVELS
//================================================

GithubAPIManager.prototype.loadCurrentProjectLevels = function(_promise) {
  if(this.foldersData.levels == null){
    if(_promise != null)
      _promise.call(this,{"success":false});
    return;
  }
  var url = "https://api.github.com/repos/"+this.userName+
          "/"+this.currentRepoName+"/git/trees/"+this.foldersData.levels.sha+"?recursive=1";
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
            instance.getLevels(_data.tree);
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

//Get all levels in the folder and store them
GithubAPIManager.prototype.getLevels = function(_levelsTree){

  for(var i=0; i < _levelsTree.length; i++){
    var gitData = _levelsTree[i];
    if( gitData == null)
      return;

    //if it's a file
    if(gitData.type == "blob"){
      //____get simple image name____
      var levelName = "/"+gitData.path;
      //get extension
      var extension = levelName.substr(levelName.lastIndexOf("."));
      if(/.(json)/i.test(extension)){
        //process image name
        levelName = this.processPathToName(levelName);
        //build image url
        var levelUrl = "/"+gitData.path;
        //short path
        var shortPath = levelUrl.substring(1);
        var extIndex = shortPath.indexOf(".json");
        if( extIndex >= 0){
          shortPath = shortPath.substring(0,extIndex);
        }
        //build data
        var levelData = {"path":levelUrl, "name":levelName, "shortPath":shortPath};
        levelData.sha = gitData.sha;
        //push it in images
        this.$scope.project.assets.levels.push( levelData );
      }
    }
  }
}


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

function isStringValid(_string){
  return _string != null && _string != "";
}