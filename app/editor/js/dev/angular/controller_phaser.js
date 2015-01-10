"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('PhaserCtrl', ["$scope", "$http", "$timeout", 
	function($scope, $http, $timeout) {
	function main() {

		$scope.ID_count = 0;

		$scope.cutscenes = [];
		$scope.loadedImages = new Array();
		$scope.loadedAtlases = new Array();

		//============ PROJECT ===================

		$scope.$on("sendProjectBroadcast", function(_event, _args) {
			$scope.project = _args.project;
		});

		//unused
		$scope.$on("loadBitmapFontsBroadcast", function(_event, _args) {
			$scope.loadBitmapFonts(_args.bitmapFonts);
		});

		//============ ADDING ENTITIES ===================

		$scope.$on("addGroupBroadcast", function(_event) {
			$scope.addGroup();
		});

		$scope.$on("addSpriteBroadcast", function(_event) {
			$scope.addSprite();
		});

		$scope.$on("addTileSpriteBroadcast", function(_event) {
			$scope.addTileSprite();
		});

		$scope.$on("addButtonBroadcast", function(_event) {
			$scope.addButton();
		});

		$scope.$on("addTextBroadcast", function(_event) {
			$scope.addText();
		});

		$scope.$on("addBitmapTextBroadcast", function(_event) {
			$scope.addBitmapText();
		});

		//================== DELETE / CLONE / MISC ======================

		$scope.$on("cloneEntityBroadcast", function(_event, _args) {
			$scope.cloneEntity(_args.entity,_args.position);
		});

		$scope.$on("deleteEntityBroadcast", function(_event, _args) {
			$scope.deleteEntity(_args.entity);
		});

		$scope.$on("lockEntityBroadcast", function(_event, _args) {
			$scope.lockEntity(_args.entity);
		});

		$scope.$on("selectEntityBroadcast", function(_event, _args) {
			$scope.$emit("refreshCurrentEntityEmit", _args);
			$scope.activateEntityHandle(_args.entity);
		});

		$scope.$on("moveEntityToEditorBroadcast", function(_event, _args) {
			$scope.moveEntityToEditorGroup(_args.entity);
		});

		$scope.$on("fixEntityToCameraBroadcast", function(_event, _args) {
			$scope.fixEntityToCamera(_args.entity);
		});

		$scope.$on("reassignIDBroadcast", function(_event, _args) {
			$scope.reassignID(_args.entity);
		});

		$scope.$on("revertPrefabBroadcast", function(_event, _args) {
			$scope.revertPrefab(_args.entity);
		});

		//================== IMAGES ======================

		$scope.$on("getImagesBroadcast", function(_event, _args) {
			var images = $scope.getImages();
			$scope.sendImages(images);
		});

		$scope.$on("loadImageBroadcast", function(_event, _args) {
			$scope.loadImage(_args.image);
		});

		$scope.$on("unloadImageBroadcast", function(_event, _args) {
			$scope.unloadImage(_args.image);
		});

		$scope.$on("loadAtlasBroadcast", function(_event, _args) {
			$scope.loadAtlas(_args.atlas);
		});

		$scope.$on("unloadAtlasBroadcast", function(_event, _args) {
			$scope.unloadAtlas(_args.atlas);
		});

		//============= IMPORT / EXPORT ======================

		$scope.$on("importLevelBroadcast", function(_event, _args) {
			$scope.import(_args.levelPath, _args.levelName, _args.levelStorage);
		});

		$scope.$on("importEntityBroadcast", function(_event, _args) {
			$scope.importEntity(_args.entity);
		});

		$scope.$on("exportLevelBroadcast", function(_event, _args) {
			$scope.export(_args.levelPath, _args.levelName, _args.levelStorage);
		});

		$scope.$on("importPrefabBroadcast", function(_event, _args) {
			$scope.importPrefab(_args.prefab);
		});

		$scope.$on("saveCutscenesBroadcast", function(_event, _args) {
			$scope.cutscenes = _args.cutscenes;
		});

		$scope.$on("saveSettingsBroadcast", function(_event, _args) {
			$scope.saveSettings(_args);
		});

		$timeout(function() {
			$scope.createPhaser();

			$timeout(function() {
				$scope.sendCamera();
				$scope.sendWorld();
			}, 500);
		}, 500);
	};

	$scope.createPhaser = function() {
		var functions = {
			preload: $scope.preload,
			create: $scope.create,
			update: $scope.update,
			render: $scope.render
		};
		var width =	window.innerWidth;
		var header = $("header");
		if (header.length > 0) {
			header = header[0];
		}
		var headerHeight = $(header).height();
		var height = window.innerHeight - headerHeight;
		$scope.game = new Phaser.Game(width, height, Phaser.AUTO, 'phaser', functions);
	};

	$scope.preload = function() {
		$scope.loadBitmapFonts($scope.project.assets.bitmapFonts);
		$scope.game.load.image("none", "assets/images/none.png");
		$scope.game.load.image("__background", "assets/images/background.png");
		$scope.game.load.image("__select", "assets/images/select.png");
		$scope.game.load.image("__x_move", "assets/images/x_move.png");
		$scope.game.load.image("__y_move", "assets/images/y_move.png");
	};

	$scope.create = function() {
    	$scope.game.physics.startSystem(Phaser.Physics.P2JS);
		$scope.game.plugins.add(Phaser.Plugin.Pollinator);
		//input manager
		$scope.game.plugins.add(Phaser.Plugin.InputManager);
		$scope.game.inputManager.init( LR.Editor.Settings.keysData );

		this.state = "idle";

		$scope.game.world.setBounds(-10000, -10000, 20000, 20000);

		$scope.game.camera.x = $scope.game.camera.width * -0.5;
		$scope.game.camera.y = $scope.game.camera.height * -0.5;

		//Camera input
		$scope.game.inputManager.bindMousePress( activateCameraFollow, this , Phaser.Mouse.MIDDLE_BUTTON);
		$scope.game.inputManager.bindMouseRelease( deactivateCameraFollow, this, Phaser.Mouse.MIDDLE_BUTTON);
		$scope.game.inputManager.bindMouseWheel(mouseWheelHandler,this)
		$scope.game.camera.bounds = null;

		$scope.createEditorEntities();

		$scope.$emit("refreshListEmit", {world: $scope.game.world});

		// import default level if set
		$timeout(function() {
			if (localStorage) {
				var newLevel = localStorage.getItem("project.newLevel");
				if(newLevel == "true"){
      				localStorage.setItem("project.newLevel", false);
					return;
				}

				//if we are importing a level
				var levelImport = localStorage.getItem("project.levelImport");
      			if (levelImport != "null") {
      				localStorage.setItem("project.levelImport", null);
      				localStorage.setItem("project.levelDefault", levelImport);
      			} else {
					//if we are just launching the editor, check default;
					levelImport = localStorage.getItem("project.levelDefault");      				
      			}
				if (levelImport !== null && levelImport !== "null") {
					$scope.project.level = levelImport;
					var levelPath = $scope.project.path + "/assets/levels";
					$scope.import(levelPath, levelImport, "file", function(err) {
						if (err) {
							console.warn(err);
						}
					});
				}
			}
		}, 1000);
	};

	$scope.update = function() {
		$scope.game.world.bringToTop($scope.editorGroup);

		if( this.cameraFollowMouse ){
			cameraFollow($scope);
		}

		$scope.xMouseText.text = "x:" + Math.round($scope.game.input.mousePointer.worldX);
		$scope.yMouseText.text = "y:" + Math.round($scope.game.input.mousePointer.worldY);
	};

	$scope.render = function() {
		$scope.forAllGameObjects($scope.game.world, function(_gameobject) {
			if (_gameobject.drawBounds == true) {
				$scope.game.debug.spriteBounds(_gameobject);
			}
		});
	};

	$scope.createEditorEntities = function() {
		var worldBounds = $scope.game.world.bounds;
		var background = $scope.game.add.tileSprite(
			worldBounds.x, worldBounds.y, worldBounds.width, worldBounds.height,
			"__background", 0
		);
		background.name = "__background";
		
		$scope.editorGroup = new LR.Entity.Group($scope.game);
		$scope.game.add.existing($scope.editorGroup);
		$scope.editorGroup.name = "__editor";
		//Camera DEbug
		$scope.changeGameCameraSize($scope.project.settings.camera);
		//entity handle
		$scope.entityHandle = new LR.Entity.Group($scope.game,0,0);
		$scope.entityHandle.name = "__entity_handle";
		$scope.entityHandleScript = $scope.entityHandle.go.addBehaviour( new LR.Editor.Behaviour.EntityHandle($scope.entityHandle.go,$scope));
		$scope.editorGroup.add($scope.entityHandle);
		//mouse position
		$scope.xMouseText = new LR.Entity.Text($scope.game,2,20,"x:",{ font: "20px Arial", fill: "0x000000"},"__xMouse");
		$scope.xMouseText.fixedToCamera = true;
		$scope.xMouseText.anchor.x = 0;
		$scope.game.add.existing($scope.xMouseText);
		$scope.editorGroup.add($scope.xMouseText);
		$scope.yMouseText = new LR.Entity.Text($scope.game,2,50,"y:",{ font: "20px Arial", fill: "0x000000"},"__xMouse");
		$scope.yMouseText.fixedToCamera = true;
		$scope.yMouseText.anchor.x = 0;
		$scope.game.add.existing($scope.yMouseText);
		$scope.editorGroup.add($scope.yMouseText);
	};

	$scope.sendCamera = function() {
		if ($scope.game.camera) {
			$scope.$emit("sendCameraEmit", {camera: $scope.game.camera});
		}
	};

	$scope.sendWorld = function() {
		if ($scope.game.world) {
			$scope.$emit("sendWorldEmit", {world: $scope.game.world});
		}
	};

	$scope.forAllGameObjects = function(_parent, _do) {
		if (_parent instanceof LR.GameObject) {
			_do(_parent);
		} 

		if (_parent.children != null) {
			for (var i = 0; i < _parent.children.length; i++) {
				var child = _parent.children[i];
				$scope.forAllGameObjects(child, _do);
			};
		}
	};

	$scope.activateEntityHandle = function(_entity){
		if( _entity.ed_locked )
			return;
		$scope.currentEntity = _entity;
		if( _entity.parent != $scope.editorGroup && _entity != $scope.game.world ){
			if($scope.game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)){
				$scope.entityHandleScript.addTarget(_entity);
			}else{
				$scope.entityHandleScript.activate(_entity);
			}
		}else{
			$scope.entityHandleScript.deactivate();
		}
	}


	//===================================================================
	//					ADDING OPERATIONS
	//===================================================================

	$scope.addGroup = function() {
		var group = new LR.Entity.Group($scope.game);
		group.name = "group" + $scope.game.world.children.length;
		group.go.id = $scope.getID() ;
		$scope.game.add.existing(group);
		this.checkAddingEntity(group);
	};

	$scope.addSprite = function() {
		//Create Sprite at the center of the view
		var sprite = new LR.Entity.Sprite($scope.game, $scope.game.camera.view.centerX,
										 $scope.game.camera.view.centerY, "none");
		sprite.name = "sprite" + $scope.game.world.children.length;
		sprite.go.id = $scope.getID();
		//add Input Handler, for dragging and other events
		sprite.go.addBehaviour(new LR.Editor.Behaviour.EntityInputHandler(sprite.go, $scope));
		sprite.ed_locked = false;
		sprite.ed_fixedToCamera = false;
		//Add to editor game
		$scope.game.add.existing(sprite);
		this.checkAddingEntity(sprite);
	};

	$scope.addTileSprite = function() {
		//Create TileSprite at the center of the view
		var tilesprite = new LR.Entity.TileSprite($scope.game, 
										$scope.game.camera.view.centerX, /* x */
										$scope.game.camera.view.centerY, /* y */
										32,32, /* width, height */
										"none");
		tilesprite.name = "tilesprite" + $scope.game.world.children.length;
		tilesprite.go.id = $scope.getID();
		//add Input Handler, for dragging and other events
		tilesprite.go.addBehaviour(new LR.Editor.Behaviour.EntityInputHandler(tilesprite.go, $scope));
		tilesprite.ed_locked = false;
		tilesprite.ed_fixedToCamera = false;
		//Add to editor game
		$scope.game.add.existing(tilesprite);
		this.checkAddingEntity(tilesprite);
	};

	$scope.addButton = function() {
		//Create Button at the center of the view
		var button = new LR.Entity.Button(
			$scope.game, 
			$scope.game.camera.view.centerX, /* x */
			$scope.game.camera.view.centerY,
			null,
			0, null, 0, 0
		);
		console.log(button);
		button.name = "button" + $scope.game.world.children.length;
		button.go.id = $scope.getID();
		//add Input Handler, for dragging and other events
		button.go.addBehaviour(new LR.Editor.Behaviour.EntityInputHandler(button.go, $scope));
		button.ed_locked = false;
		button.ed_fixedToCamera = false;
		//fill frames
		button.onOverFrameID = 0;
		button.onOutFrameID = 0;
		button.onDownFrameID = 0;
		button.onUpFrameID = 0;
		//Add to editor game
		$scope.game.add.existing(button);
		this.checkAddingEntity(button);
	};

	$scope.addText = function() {
		var text = new LR.Entity.Text($scope.game, 
										$scope.game.camera.view.centerX, /* x */
										$scope.game.camera.view.centerY, /* y */
										"New Text");
		text.name = "Text";
		text.go.id = $scope.getID();
		//add Input Handler, for dragging and other events
		text.go.addBehaviour(new LR.Editor.Behaviour.EntityInputHandler(text.go, $scope));
		text.ed_locked = false;
		text.ed_fixedToCamera = false;
		//Add to editor game
		$scope.game.add.existing(text);
		this.checkAddingEntity(text);
	};

	$scope.addBitmapText = function() {
		if($scope.project.assets.bitmapFonts.length <= 0) {
			window.alert("Error while creating BitmapText Entity: No BitmapFont \"founds\" in fonts folder. Try to add a BitmapFont please.");
			return;
		}
		var text = new LR.Entity.BitmapText($scope.game, 
										$scope.game.camera.view.centerX, /* x */
										$scope.game.camera.view.centerY, /* y */
										$scope.project.assets.bitmapFonts[0].name,
										"New Text", 64);
		text.name = "BitmapText";
		text.go.id = $scope.getID();
		//add Input Handler, for dragging and other events
		text.go.addBehaviour(new LR.Editor.Behaviour.EntityInputHandler(text.go, $scope));
		text.ed_locked = false;
		text.ed_fixedToCamera = false;
		//Add to editor game
		$scope.game.add.existing(text);
		this.checkAddingEntity(text);
	};

	$scope.getID = function(){
		$scope.ID_count ++;
		return $scope.ID_count;
	}

	$scope.reassignID = function(_entity,_crossRefArray){
		if( _crossRefArray == null)
			_crossRefArray = new Array();
		var crossRef = null;
		if(_entity.go){
			var crossRef = {"formerID": _entity.go.id};
			_entity.go.id = $scope.getID();
			crossRef.newID = _entity.go.id;
		}
		if( crossRef != null )
			_crossRefArray.push(crossRef);
		if( _entity.children != null ){
			for( var i=0; i < _entity.children.length; i ++){
				$scope.reassignID( _entity.children[i],_crossRefArray );
			}
		}
		return _crossRefArray;
	}

	$scope.checkAddingEntity = function(_entity){
		if( $scope.currentEntity != null ){
			var parent = $scope.currentEntity;
			if( parent.type != Phaser.GROUP){
				parent = parent.parent;
			}
			_entity.go.changeParent(parent);
			if( parent.go && parent.go.name != "__world" ){
				_entity.x = 0; _entity.y = 0;
			}
		}
	}

	//===================================================================
	//					ENTITY OPERATIONS
	//===================================================================

	$scope.cloneEntity = function(_entity,_position) {
		var exporter = new LR.LevelExporter();
		var eObj = exporter.exportEntities(_entity);

		var importer = new LR.Editor.LevelImporterEditor($scope);
		var iObj = importer.importEntities(eObj, $scope.game);
		//rename
		if( iObj.name.indexOf("(clone)") < 0 )
			iObj.name += " (clone)";
		
		var crossRefArray = $scope.reassignID(iObj);
		$scope.refreshCloneBehavioursParamReferences(iObj,crossRefArray);
		iObj.go.changeParent(_entity.parent);
		//reposition
		if( _position ){
			//compute local position of the mouse in the parent's transform
			if(_entity.parent.world){
				_position.x -= _entity.parent.world.x;
				_position.y -= _entity.parent.world.y;
			}
			iObj.go.x = _position.x; iObj.go.y = _position.y;
		}
		if(iObj.parent.ed_outOfViewHide == true)
			iObj.ed_outOfViewHide = true;
		$scope.$emit("refreshListEmit", {world: $scope.game.world});
		//Select clone
		$scope.$emit("selectEntityEmit", {entity : iObj});

		$scope.forceAttributesRefresh(iObj);
	};

	$scope.deleteEntity = function(_entity) {
		//Deactivate EntityHandle if its target is about to be deleted
		$scope.entityHandleScript.deactivateEntity(_entity);

		if( $scope.currentEntity == _entity){
			$scope.currentEntity = null;
		}
		_entity.destroy();

		$scope.$emit("refreshListEmit", {world: $scope.game.world});
	};

	$scope.lockEntity = function(_entity){

		_entity.go.sendMessage("lock");

		if( $scope.entityHandleScript.target === _entity ){
			$scope.entityHandleScript.deactivate();
		}
	}

	$scope.forceAttributesRefresh = function(_currentEntity,_forceBodyRefresh){
		$timeout( function() { 
					$scope.$emit("refreshCurrentEntityEmit",
								{entity : _currentEntity,
								forceBodyRefresh : _forceBodyRefresh,
								phaser : true
					});
				},
				100);
	}

	$scope.moveEntityToEditorGroup = function(_entity){
		var oldParent = _entity.parent;
		oldParent.remove(_entity);
		$scope.editorGroup.add(_entity);
	}

	// Fix the entity the game camera (simulated in the editor)
	// This will add a EntityCameraFixer behaviour to the entity
	// You can chose to keep the current x & y values as the cameraOffset's
	$scope.fixEntityToCamera = function(_entity,_keepValues){
		if( _keepValues != null && _keepValues == true ){
			_entity.cameraOffset.x = _entity.x;
			_entity.cameraOffset.y = _entity.y;
		}else{			
			_entity.cameraOffset.x = 0;
			_entity.cameraOffset.y = 0;
		}
		//
		var bh = _entity.go.getBehaviour(LR.Editor.Behaviour.EntityCameraFixer);
		if( bh == null ){
			_entity.go.addBehaviour( new LR.Editor.Behaviour.EntityCameraFixer(_entity.go,$scope) );
		}else{
			bh.enabled = true;
		}
		$scope.$emit("refreshCurrentEntityEmit",{entity : _entity} );
	}

	//When an entity is cloned, we need to be able to recheck its references 
	//in behaviours parameters to match it with the new entities' ids
	$scope.refreshCloneBehavioursParamReferences = function(_entity,_crossRefArray){
		if(_entity.behaviours == null)
			return;
		//For each behaviour
		for(var i=0; i < _entity.behaviours.length; i++){
			var bh = _entity.behaviours[i];
			for(var key in bh.params){
				var val = bh.params[key];
				if(typeof val == "string" && val.indexOf("#GO_")>=0 ){
					var idRef = val.substring(4);
					var newID;
					for(var j=0; j < _crossRefArray.length; j++){
						if( _crossRefArray[j].formerID == idRef){

							newID = _crossRefArray[j].newID;
							break;
						}
					}
					bh.params[key] = "#GO_"+newID;
				}
			}
		}

		//Recursive for children
		if(_entity.children){
			for(var i=0; i < _entity.children.length; i++){
				$scope.refreshCloneBehavioursParamReferences(_entity.children[i],_crossRefArray);
			}
		}
	}

	//===================================================================
	//						IMAGES
	//===================================================================

	$scope.getImages = function() {
		var images = new Array();

		var keys = $scope.game.cache.getKeys(Phaser.Cache.IMAGE);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var image = $scope.game.cache.getImage(key);
			if ($scope.isEditorImage(image) == false) {
				images.push(image);
			}
		};

		return images;
	}

	$scope.sendImages = function(_images) {
		$scope.$emit("sendImagesEmit", {images: _images});
	}

	$scope.loadImage = function(_image) {
		$scope.game.load.spritesheet(
			_image.name,
			$scope.project.path + "/assets/images" + _image.path,
			parseInt(_image.frameWidth),
			parseInt(_image.frameHeight)
		);

		var successCallback = function() {

			$scope.$apply(function() {
				_image.loaded = true;
			});

			$scope.loadedImages.push(_image);

			$scope.game.load.onFileComplete.remove(successCallback);
			$scope.game.load.onFileComplete.remove(errorCallback);
		};
		var errorCallback = function() {
			alert("Sorry but the editor can't load your image '" + _image.name + "' (maybe a frame width/frame height error).");
			
			$scope.game.load.onFileComplete.remove(successCallback);
			$scope.game.load.onFileComplete.remove(errorCallback);
		};
		
		$scope.game.load.onFileComplete.add(successCallback);
		$scope.game.load.onFileError.add(errorCallback);

		$scope.game.load.start();
	};

	$scope.unloadImage = function(_image) {
		if (_image) {
			//find in loaded images
			var indexOfImage = -1;
			for(var i=0; i < $scope.loadedImages.length; i ++){
				if( $scope.loadedImages[i].name == _image.name)
					indexOfImage = i;
			}
			//if found, remove from array of loaded images
			if( indexOfImage >= 0)
				$scope.loadedImages.splice( indexOfImage,1);

			$scope.forAllGameObjects($scope.game.world, function(_gameobject) {
				if (_gameobject.key === _image.name) {
					_gameobject.loadTexture("none");
				}
			});
			$scope.game.cache.removeImage(_image.name);
			_image.frameWidth = null;
			_image.frameHeight = null;
			_image.loaded = false;
		}
	};

	$scope.isEditorImage = function(_image) {
		var editorImage = false;

		if (typeof _image.name === "string") {
			if (_image.name[0] == "_" && _image.name[1] == "_") {
				editorImage = true;
			}
		}

		return editorImage;
	};

	$scope.loadBitmapFonts = function(_bitmapFonts){
		var fontsPath = $scope.project.path + "/assets/fonts";
		for(var i=0; i < _bitmapFonts.length; i++){
			$scope.game.load.bitmapFont( _bitmapFonts[i].name,
									fontsPath + _bitmapFonts[i].path, 
									fontsPath + _bitmapFonts[i].pathData);
		}
	};

	$scope.loadAtlas = function(_atlas) {
		
    	$scope.game.load.atlas(_atlas.name, 
    						$scope.project.path +"/assets/atlases"+_atlas.path+".png",
    						$scope.project.path +"/assets/atlases"+_atlas.path+".json");
		$scope.game.load.json(_atlas.name, $scope.project.path +"/assets/atlases"+_atlas.path+".json");
		var successCallback = function() {
			$scope.$apply(function() {
				_atlas.loaded = true;
				_atlas.frames = $scope.game.cache.getJSON(_atlas.name).frames;
			});
			$scope.loadedAtlases.push(_atlas);

			$scope.game.load.onLoadComplete.remove(successCallback);
			$scope.game.load.onFileComplete.remove(errorCallback);
		};
		var errorCallback = function() {
			alert("Sorry but the editor can't load your atlas '" + _atlas.name );
			
			$scope.game.load.onLoadComplete.remove(successCallback);
			$scope.game.load.onFileComplete.remove(errorCallback);
		};
		
		$scope.game.load.onLoadComplete.add(successCallback);
		$scope.game.load.onFileError.add(errorCallback);

		$scope.game.load.start();
	}

	$scope.unloadAtlas = function(_atlasName){

	}

	//===================================================================
	//					IMPORT / EXPORT
	//===================================================================

	$scope.import = function(_levelPath, _levelName, _storage, _promise) {
		if (_storage === "file") {
			var url = "/editorserverapi/v0/level";
			url += _levelName;
			url += "?path=" + _levelPath;
			$http.get(url).success(function(_data) {
				var importer = new LR.Editor.LevelImporterEditor($scope);
				importer.import(_data, $scope.game, function(_err, _root, _game,_project) {
					
					if (typeof _promise === "function") {
						_promise(_err, _root);
					}
					//build loaded atlases array
					for(var i=0; i < _project.assets.atlases.length; i++){
						if(_project.assets.atlases[i].loaded){
							$scope.loadedAtlases.push( _project.assets.atlases[i]);
						}
					}
					$scope.$emit("sendLoadedAtlasesEmit",{"atlases":$scope.loadedAtlases});
				
				});

				$scope.loadedImages = JSON.parse( JSON.stringify( _data.assets.images ) );				
				$scope.$emit("sendLoadedImagesEmit",{"images":$scope.loadedImages});
				
				$scope.importSettings(_data.settings);

				//cutscenes should be imported now
				$scope.$emit("sendCutscenesEmit", {"cutscenes":$scope.cutscenes});
			}).error(function(_error) {
				console.error(_error);
			});
		}
	};

	$scope.importEntity = function(_entity) {
		var importer = new LR.Editor.LevelImporterEditor($scope);
		var iObj = importer.importEntities(_entity, $scope.game);

		$scope.reassignID( iObj );
		$scope.$emit("refreshListEmit", {world: $scope.game.world});
		$scope.forceAttributesRefresh(iObj);
	};

	//$scope.export = function(_url, _levelName, _storage) {
	$scope.export = function(_levelPath, _levelName, _storage) {
		var exporter = new LR.LevelExporter();
		var level = exporter.export($scope.game, $scope.project,$scope.cutscenes);
		var lvlStr = JSON.stringify(level);

		if (_storage == null || _storage === "localstorage") {
			_storage = "localstorage";
			localStorage.setItem(_levelName, lvlStr);
		} else if (_storage === "file") {
			var req = {
				method: 'POST',
				url: "/editorserverapi/v0/level",
				headers: {
					'Content-Type': undefined // AngularJs will choose by itself (more secure)
				},
				data: {
					name: _levelName + ".json",
					path: _levelPath,
					data: lvlStr
				},
				transformRequest: $scope.transformLevelDataToFormData
			};

			$http(req).success(function(data) {
				// do nothing
			}).error(function(error) {
				console.error(error);
			});
		}
	};

	$scope.transformLevelDataToFormData = function(data) {
		var fd = new FormData();
		angular.forEach(data, function(value, key) {
			fd.append(key, value);
		});

		return fd;
	};

	//===============================================================
	//							PREFABS
	//===============================================================

	//Used for prefabs
	$scope.importPrefab = function(_prefabData) {
		var importer = new LR.Editor.LevelImporterEditor($scope);
		importer.import(_prefabData, $scope.game, $scope.onPrefabLoaded);
	};

	$scope.onPrefabLoaded = function(_error,_rootEntity,_game){
		if(_rootEntity == null){
			console.warn("Prefab not rightly loaded");
			return;
		}
		$scope.storeNewLoadedPrefabImages(_rootEntity);
		//store references in behaviours params
		//IDs will change so we need to keep them
		var linkedObjects = $scope.storeBehavioursParamsReferences(_rootEntity,new Object(),_rootEntity);
		//reassign IDs. The id of the imported objects may already be in use
		$scope.reassignID( _rootEntity);
		//Reassign parameters with new objects IDs
		$scope.reassignBehavioursParamsReferences(_rootEntity,linkedObjects);

		if(_rootEntity.ed_fixedToCamera == false){
			_rootEntity.go.x = $scope.game.camera.view.centerX;
			_rootEntity.go.y = $scope.game.camera.view.centerY;
		}

		$scope.$emit("refreshListEmit", {world: _game.world});
		$scope.forceAttributesRefresh(_rootEntity);
	}

	$scope.storeBehavioursParamsReferences = function(_entity,_linkedObjects,_prefabRoot){
		if(_entity.behaviours == null)
			return;
		//For each behaviour
		for(var i=0; i < _entity.behaviours.length; i++){
			var bh = _entity.behaviours[i];
			for(var key in bh.params){
				var val = bh.params[key];
				if(typeof val == "string" && val.indexOf("#GO_")>=0 ){
					var id = parseInt( val.substring(4) );
					_linkedObjects[val] = LR.Entity.FindByID(_prefabRoot,id);
				}
			}
		}
		//Recursive for children
		if(_entity.children){
			for(var i=0; i < _entity.children.length; i++){
				$scope.storeBehavioursParamsReferences(_entity.children[i],_linkedObjects,_prefabRoot);
			}
		}
		return _linkedObjects;
	} 

	$scope.reassignBehavioursParamsReferences = function(_entity,_linkedObjects){
		if(_entity.behaviours == null)
			return;
		//For each behaviour
		for(var i=0; i < _entity.behaviours.length; i++){
			var bh = _entity.behaviours[i];
			for(var key in bh.params){
				var val = bh.params[key];
				if(typeof val == "string" && val.indexOf("#GO_")>=0 ){
					var linkedObj = _linkedObjects[val];
					if( linkedObj != null)
						bh.params[key] = "#GO_"+linkedObj.go.id;
				}
			}
		}

		//Recursive for children
		if(_entity.children){
			for(var i=0; i < _entity.children.length; i++){
				$scope.reassignBehavioursParamsReferences(_entity.children[i],_linkedObjects);
			}
		}
	}

	//Look into prefab keys and store new keys
	$scope.storeNewLoadedPrefabImages = function(_rootEntity){
		if(_rootEntity.key != null && ! _rootEntity.isAtlas){
			//search key in loaded images
			var found = false;
			for(var i=0; i < $scope.loadedImages.length; i++){
				var img = $scope.loadedImages[i];
				if( img.name == _rootEntity.key ){
					found = true;
					break;
				}
			}
			//if not found, add the image to the loaded ones
			if( ! found ){
				for(var i=0; i < $scope.project.assets.images.length; i++){
					var assetImage = $scope.project.assets.images[i];
					if( assetImage.name == _rootEntity.key ){
						$scope.loadedImages.push(
							JSON.parse( JSON.stringify(assetImage))
						);
					}
				}
			}
		}
		//do the same for children
		if( _rootEntity.children ){
			for(var c=0; c < _rootEntity.children.length; c++){
				$scope.storeNewLoadedPrefabImages( _rootEntity.children[c] );
			}
		}
	}

	$scope.revertPrefab = function(_rootPrefab){
		var url = "/editorserverapi/v0/prefab/" + _rootPrefab.prefab.name;
	    url += "?path=" + $scope.project.path + "/assets/prefabs";
	    
	    $http.get(url).success(function(_data) {
	    	//set prefab data to new imported entity	    
		    _data.prefabName = _rootPrefab.prefab.name;
		    _data.prefabPath = _rootPrefab.prefab.path;
		    //import	      
			var importer = new LR.Editor.LevelImporterEditor($scope);
			importer.import(_data, $scope.game, $scope.onRevertedPrefabLoaded);
			$scope.currentRevertedPrefab = _rootPrefab;
	    }).error(function(_error) {
	      console.error(_error);
	    });
	}

	$scope.onRevertedPrefabLoaded = function(_error,_rootEntity,_game){
		//keep position
		var oldPos = {x:$scope.currentRevertedPrefab.x,y:$scope.currentRevertedPrefab.y};
		//Set new entity's parent
		var parent = $scope.currentRevertedPrefab.parent;
		var oldParent = _rootEntity.parent;
		oldParent.remove(_rootEntity);
		parent.add(_rootEntity);
		_rootEntity.go.x = oldPos.x; _rootEntity.go.y = oldPos.y;
		$scope.copyPrefabIDs($scope.currentRevertedPrefab,_rootEntity);
		//Delete former entity
		$scope.deleteEntity($scope.currentRevertedPrefab);
		$scope.currentRevertedPrefab = null;

		$scope.$emit("refreshListEmit", {world: $scope.game.world});
		$scope.$emit("selectEntityEmit", {entity : _rootEntity});
		$scope.forceAttributesRefresh(_rootEntity);
	}

	$scope.copyPrefabIDs = function(_oldPrefab,_newPrefab){
		//begin by reseting depth
		while( Math.abs(_newPrefab.z - _oldPrefab.z) > 1){
			if(_newPrefab.z > _oldPrefab.z){
				_newPrefab.parent.moveDown(_newPrefab);
				_newPrefab.parent.updateTransform();
			}
		}

		//then reassign ids when possible
		//for every entity in the old prefab
		var changeIDs = function(_oldEntity,_newEntity){

			//search an object with the same name in the new entity(prefab)
			var search = LR.GameObject.FindByName(_newEntity, _oldEntity.go.name);
			
			//affect the same id as the old prefab entity
			if( search != null )
				search.go.id = _oldEntity.go.id;
			//Search children
			for( var i=0; i < _oldEntity.children.length;i++ ) {
				changeIDs(_oldEntity.children[i],_newEntity);	
			};
		}
		//store references in behaviours params
		//keeps ID of params reference to gameobjects in the scene from the old prefab
		var linkedObjects = $scope.storeBehavioursParamsReferences(_newPrefab,new Object(),_newPrefab);
		
		//Reset ID to their former values in the current scene
		changeIDs(_oldPrefab,_newPrefab);
		
		//Reassign parameters with new objects IDs
		$scope.reassignBehavioursParamsReferences(_newPrefab,linkedObjects);


	}

	//===============================================================
	//							EDITOR CAMERA
	//===============================================================

	function activateCameraFollow(){
		this.cameraFollowMouse = true;
		this.state = "camera_drag";
	}

	function cameraFollow(_$scope){
		//compute direction from the center of the camera to the mouse
		var point = new Phaser.Point();
		point.x = _$scope.game.input.activePointer.x - _$scope.game.camera.width * 0.5;
		point.y = _$scope.game.input.activePointer.y - _$scope.game.camera.height * 0.5;
		//follow that direction
		_$scope.game.camera.x += point.x * _$scope.game.time.elapsed * 0.0015;
		_$scope.game.camera.y += point.y * _$scope.game.time.elapsed * 0.0015;

		$scope.project.settings.ed_camera = { x: $scope.game.camera.x, y: $scope.game.camera.y};
	}

	function deactivateCameraFollow(){
		this.cameraFollowMouse = false;
	}

	function mouseWheelHandler(_wheelData){
		if(! $scope.game.input.keyboard.isDown(Phaser.Keyboard.SHIFT) )
			return;
		$scope.game.world.scale.x += _wheelData.delta * 0.05;
		$scope.game.world.scale.y += _wheelData.delta * 0.05;
		if( $scope.game.world.scale.x <= 0.1 ){
			$scope.game.world.scale.x = 0.1;
			$scope.game.world.scale.y = 0.1;
		}

		//compute direction from the center of the camera to the mouse
		var point = new Phaser.Point();
		point.x = $scope.game.input.activePointer.x - $scope.game.camera.width * 0.5;
		point.y = $scope.game.input.activePointer.y - $scope.game.camera.height * 0.5;

		var maxSpeedZoom = 15;
		if( point.x > maxSpeedZoom || point.y > maxSpeedZoom)
			point = point.normalize().multiply(maxSpeedZoom,maxSpeedZoom);

		$scope.game.camera.x += point.x ;
		$scope.game.camera.y += point.y ;

		if ($scope.game.camera.ed_debugObject.fixedToCamera) {
			var camW = $scope.game.camera.width;
			var debObjW = (
				$scope.project.settings.camera.width * $scope.game.world.scale.x
			);
			$scope.game.camera.ed_debugObject.cameraOffset.x = Math.round(
				(camW - debObjW) * 0.5
			);

			var camH = $scope.game.camera.height;
			var debObjH = (
				$scope.project.settings.camera.height * $scope.game.world.scale.y
			);
			$scope.game.camera.ed_debugObject.cameraOffset.y = Math.round(
				(camH - debObjH) * 0.5
			);
		}

	}

	//===============================================================
	//							GAME SETTINGS
	//===============================================================

	//called when importing a level
	$scope.importSettings = function(_dataSettings){
		if( _dataSettings == null)
			return;
		$scope.project.settings = JSON.parse(JSON.stringify(_dataSettings));
		$scope.changeGameCameraSize(_dataSettings.camera);
		if(_dataSettings.ed_camera){
			$scope.game.camera.x = _dataSettings.ed_camera.x ;
			$scope.game.camera.y = _dataSettings.ed_camera.y ;
		}
	}

	//called when settings are saved
	$scope.saveSettings = function(_dataSettings){
		if( _dataSettings == null)
			return;
		$scope.changeGameCameraSize(_dataSettings.camera);
		$scope.project.settings = JSON.parse(JSON.stringify(_dataSettings));
	}

	//Mainly called by the modal settings. Changes the camera size of the game. Not the editor view
	$scope.changeGameCameraSize = function(_dataCam){
		//Create Graphics if not already done
		if( $scope.game.camera.ed_debugObject != null ){
			$scope.game.camera.ed_debugObject.destroy();
		}
		//Create standing camera
		_dataCam.fixedToCamera = false;
		$scope.game.camera.ed_debugObject = this.createDebugCameraRect(_dataCam,0x0000FF,1);
		//Create rect fixed to the editor's camera
		_dataCam.x = 0; _dataCam.y = 0; 
		_dataCam.fixedToCamera = true;
		$scope.game.camera.ed_debugObject2 = this.createDebugCameraRect(_dataCam, 0xFFFFFF, 0.15);
	}

	$scope.createDebugCameraRect = function(_dataCam,_color,_alpha){
		var rectCam = $scope.game.add.graphics(0, 0);
		rectCam.lineStyle(2, _color,_alpha);
		rectCam.name = "__cam_rect";
		$scope.moveEntityToEditorGroup(rectCam);
    	
    	rectCam.drawRect(_dataCam.x, _dataCam.y,
						_dataCam.width, _dataCam.height);
		rectCam.visible = _dataCam.debug;

		rectCam.fixedToCamera = _dataCam.fixedToCamera;
		if( _dataCam.fixedToCamera == true){
			rectCam.cameraOffset.x = 
				(window.innerWidth - _dataCam.width) * 0.5;
			rectCam.cameraOffset.y = 
				(window.innerHeight - _dataCam.height) * 0.5;
		}
		return rectCam;
	}

	main();
}]);