"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('PhaserCtrl', ["$scope", "$http", "$timeout", function($scope, $http, $timeout) {
	function main() {

		$scope.dataSettings = {
			"camera" : {
				x: -320, y: -180,
				width: 640, height:360,
				debug: true,
				fixedToCamera: true
			}
		}

		$scope.cutscenes = [];

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

		$scope.$on("addTextBroadcast", function(_event) {
			$scope.addText();
		});

		//================== DELETE / CLONE / MISC ======================

		$scope.$on("cloneEntityBroadcast", function(_event, _args) {
			$scope.cloneEntity(_args.entity);
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

		//================== IMAGES ======================

		$scope.$on("getImagesBroadcast", function(_event, _args) {
			var images = $scope.getImages();
			$scope.sendImages(images);
		});

		$scope.$on("loadImageBroadcast", function(_event, _args) {
			$scope.loadImage(
				_args.path, _args.name, _args.frameWidth, _args.frameHeight);
		});

		$scope.$on("deleteImageBroadcast", function(_event, _args) {
			$scope.deleteImage(_args.image);
		});

		//============= IMPORT / EXPORT ======================

		$scope.$on("importLevelBroadcast", function(_event, _args) {
			$scope.import(_args.levelPath, _args.levelName, _args.levelStorage);
		});

		$scope.$on("exportLevelBroadcast", function(_event, _args) {
			$scope.export(_args.levelPath, _args.levelName, _args.levelStorage);
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

		$scope.sendSettings();

		$scope.import("/game/wildrush/public/assets/levels", "tuto", "file");
	};

	$scope.update = function() {
		$scope.game.world.bringToTop($scope.editorGroup);

		if( this.cameraFollowMouse ){
			cameraFollow($scope);
		}
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
		$scope.changeGameCamera($scope.dataSettings.camera);
		//entity handle
		$scope.entityHandle = new LR.Entity.Sprite($scope.game,0,0,"__select");
		$scope.entityHandle.name = "__entity_handle";
		$scope.entityHandleScript = $scope.entityHandle.go.addBehaviour( new LR.Editor.Behaviour.EntityHandle($scope.entityHandle.go,$scope));
		$scope.editorGroup.add($scope.entityHandle);
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
		if( _entity.parent != $scope.editorGroup ){
			$scope.entityHandleScript.activate(_entity);
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
		$scope.game.add.existing(group);
	};

	$scope.addSprite = function() {
		//Create Sprite at the center of the view
		var sprite = new LR.Entity.Sprite($scope.game, $scope.game.camera.view.centerX,
										 $scope.game.camera.view.centerY, "none");
		sprite.name = "sprite" + $scope.game.world.children.length;
		//add Input Handler, for dragging and other events
		sprite.go.addBehaviour(new LR.Editor.Behaviour.EntityInputHandler(sprite.go, $scope));
		sprite.ed_locked = false;
		sprite.ed_fixedToCamera = false;
		//Add to editor game
		$scope.game.add.existing(sprite);
	};

	$scope.addTileSprite = function() {
		//Create Sprite at the center of the view
		var tilesprite = new LR.Entity.TileSprite($scope.game, 
										$scope.game.camera.view.centerX, /* x */
										$scope.game.camera.view.centerY, /* y */
										32,32, /* width, height */
										"none");
		tilesprite.name = "tilesprite" + $scope.game.world.children.length;
		//add Input Handler, for dragging and other events
		tilesprite.go.addBehaviour(new LR.Editor.Behaviour.EntityInputHandler(tilesprite.go, $scope));
		tilesprite.ed_locked = false;
		tilesprite.ed_fixedToCamera = false;
		//Add to editor game
		$scope.game.add.existing(tilesprite);
	};

	$scope.addText = function() {
		var text = new LR.Entity.Text($scope.game, 
										$scope.game.camera.view.centerX, /* x */
										$scope.game.camera.view.centerY, /* y */
										"New Text");
		text.name = "Text";
		//add Input Handler, for dragging and other events
		text.go.addBehaviour(new LR.Editor.Behaviour.EntityInputHandler(text.go, $scope));
		text.ed_locked = false;
		text.ed_fixedToCamera = false;
		//Add to editor game
		$scope.game.add.existing(text);
	};

	//===================================================================
	//					ENTITY OPERATIONS
	//===================================================================

	$scope.cloneEntity = function(_entity) {
		var exporter = new LR.LevelExporter();
		var eObj = exporter.exportEntities(_entity);

		var importer = new LR.Editor.LevelImporterEditor($scope);
		var iObj = importer.importEntities(eObj, $scope.game);

		iObj.name += " (clone)";
		iObj.go.changeParent(_entity.parent);
		$scope.$emit("refreshListEmit", {world: $scope.game.world});
		$scope.forceAttributesRefresh(iObj);
	};

	$scope.deleteEntity = function(_entity) {
		//Deactivate EntityHandle if its target is about to be deleted
		if( $scope.entityHandleScript.target === _entity ){
			$scope.entityHandleScript.deactivate();
		}
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

	$scope.loadImage = function(_path, _name, _frameWidth, _frameHeight) {
		$scope.game.load.spritesheet(_name, _path, _frameWidth, _frameHeight);
		$scope.game.load.start();
	};

	$scope.deleteImage = function(_image) {
		if (_image) {
			$scope.forAllGameObjects($scope.game.world, function(_gameobject) {
				if (_gameobject.key === _image.name) {
					_gameobject.loadTexture("none");
				}
			});
			$scope.game.cache.removeImage(_image.name);
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

	//===================================================================
	//					IMPORT / EXPORT
	//===================================================================

	$scope.import = function(_levelPath, _levelName, _storage) {
		if (_storage === "file") {
			var url = "/editorserverapi/v0/level";
			url += "?name=" + _levelName;
			url += "&path=" + _levelPath;
			$http.get(url).success(function(_data) {
				var importer = new LR.Editor.LevelImporterEditor($scope);
				importer.import(_data, $scope.game, function(err, data) {
					$scope.$apply(function() {
						// refresh the list of entities
						$scope.$emit("refreshListEmit", {world: $scope.game.world});
						
						// refresh the list of images
						var images = $scope.getImages();
						$scope.sendImages(images);
					});
				});

			$scope.importSettings(_data.settings);

			//cutscenes should be imported now
			$scope.$emit("sendCutscenesEmit",{"cutscenes":$scope.cutscenes});

			}).error(function(_error) {
				console.error(_error);
			});
		}
	};

	//$scope.export = function(_url, _levelName, _storage) {
	$scope.export = function(_levelPath, _levelName, _storage) {
		var exporter = new LR.LevelExporter();
		var level = exporter.export($scope.game,$scope.dataSettings,$scope.cutscenes);
		var lvlStr = JSON.stringify(level);

		if (_storage == null || _storage === "localstorage") {
			_storage = "localstorage";
			localStorage.setItem(_levelName, lvlStr);
		} else if (_storage === "file") {
			var url = "/editorserverapi/v0/level";
			var params = {
				name: _levelName,
				path: _levelPath,
				data: lvlStr
			};
			$http.post(url, params, function(error, data) {
				if (error) {
					console.error(error);
				} else {
					console.log("Level exported!!");
				}
			});
		}
	};

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
				$scope.dataSettings.camera.width * $scope.game.world.scale.x
			);
			$scope.game.camera.ed_debugObject.cameraOffset.x = Math.round(
				(camW - debObjW) * 0.5
			);

			var camH = $scope.game.camera.height;
			var debObjH = (
				$scope.dataSettings.camera.height * $scope.game.world.scale.y
			);
			$scope.game.camera.ed_debugObject.cameraOffset.y = Math.round(
				(camH - debObjH) * 0.5
			);
		}

	}

	//===============================================================
	//							GAME SETTINGS
	//===============================================================

	//send current settings to other controllers
	$scope.sendSettings = function(){
		if( $scope.dataSettings ){
			$scope.$emit("sendSettingsEmit", $scope.dataSettings);
		}
	}

	//called when importing a level
	$scope.importSettings = function(_dataSettings){
		if( _dataSettings == null)
			return;
		$scope.dataSettings = _dataSettings;
		$scope.sendSettings();
		$scope.changeGameCamera(_dataSettings.camera);
	}

	//called when settings are saved
	$scope.saveSettings = function(_dataSettings){
		if( _dataSettings == null)
			return;
		$scope.dataSettings = _dataSettings;
		$scope.changeGameCamera(_dataSettings.camera);
	}

	//Mainly called by the modal settings. Changes the camera size of the game. Not the editor view
	$scope.changeGameCamera = function(_dataCam){
		//Copy data
		$scope.dataSettings.camera = jQuery.extend(true, {}, _dataCam);
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