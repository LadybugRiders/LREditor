"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('AttributesCtrl', ["$scope", "$http","$modal", "$timeout",
	function($scope, $http,$modal, $timeout) {
	function main() {
		$scope.collapse = {
			general: false,
			display: true,
			physics: true,
			behaviours: true,
			misc: true
		};
		$scope.currentEntity = null;
		$scope.noneImage = new Image();
		$scope.noneImage.name = "none";
		$scope.data = {
			newBehaviour: "",
			image: $scope.noneImage,
			imageFrame: 0,
			images: new Array(),
			body : {shapes : []},
			text : {}
		};

		$scope.fonts = ["Arial", "Arial Black",
		"Comic Sans MS", "Courier New",
		"Verdana",
		"Times New Roman"];

		$scope.tweenTypes = {
			"Linear" : ["None"],
			"Quadratic" : ["In","Out","InOut"],
			"Cubic" : ["In","Out","InOut"],
			"Quartic" : ["In","Out","InOut"],
			"Quintic" : ["In","Out","InOut"],
			"Sinusoidal" : ["In","Out","InOut"],
			"Exponential" : ["In","Out","InOut"],
			"Circular" : ["In","Out","InOut"],
			"Elastic" : ["In","Out","InOut"],
			"Back" : ["In","Out","InOut"],
			"Bounce" : ["In","Out","InOut"]
		};

		$scope.modalArgsData = {
			args : {}
		};

		$scope.modalParamsData = {
		};

		$scope.$on("sendProjectBroadcast", function(_event, _args) {
			$scope.project = _args.project;
		});

		$scope.$on("sendLoadedImagesBroadcast", function(_event, _args) {
			if (_args.images) {
				$scope.data.images = _args.images
			}
		});

		$scope.$on("sendLoadedAtlasesBroadcast", function(_event, _args) {
			if (_args.atlases) {
				$scope.data.atlases = _args.atlases
			}
		});

		$scope.$on("sendAudiosBroadcast", function(_event, _args) {
			if (_args.audios) {
				$scope.data.audios = _args.audios;
			}
		});

		$scope.$on("sendBehavioursBroadcast", function(_event, _args) {
			if (_args.behaviours) {
				$scope.data.behaviours = _args.behaviours;
			}
		});

		$scope.$on("sendBitmapFontsBroadcast", function(_event, _args) {
			$scope.bitmapFonts = _args.bitmapFonts;
		});

		$scope.$on("sendLayersBroadcast", function(_event, _args) {
			$scope.layers = _args.layers;
		});

		$scope.$on("setHideOutOfViewBroadcast", function(_event, _args) {
			$scope.toggleOutOfViewHide(_args.entity,_args.value);
		});


		$scope.$on("refreshCurrentEntityBroadcast", function(_event, _args) {
			if( _args.phaser == true ){
				$scope.refreshCurrentEntityFromPhaser(_args.entity,_args.forceBodyRefresh);
			}else{
				$scope.refreshCurrentEntity(_args.entity,_args.forceBodyRefresh);
			}
		});
	};

	//================================================================
	//						GENERAL
	//================================================================

	$scope.setX = function(_x){
		if( typeof _x != "number")
			return;
		if( $scope.currentEntity && $scope.currentEntity.go){
			if( $scope.currentEntity.ed_fixedToCamera){
				$scope.currentEntity.cameraOffset.x = _x;
			}else{				
				$scope.currentEntity.go.x = _x;
			}
		}
	};

	$scope.setY = function(_y){
		if( typeof _y != "number")
			return;
		if( $scope.currentEntity && $scope.currentEntity.go ){
			if( $scope.currentEntity.ed_fixedToCamera){
				$scope.currentEntity.cameraOffset.y = _y;
			}else{		
				$scope.currentEntity.go.y = _y;
			}
		}
	};

	$scope.refreshCurrentEntityFromPhaser = function(_entity,_forceBody){
		$scope.refreshCurrentEntity(_entity,_forceBody);
		$scope.$apply();
	}

	$scope.refreshCurrentEntity = function(_entity,_forceBody) {
		
		if( _entity.game == null ){
			this.resetData();
			return;
		}
		if (_entity != null ) {
			var isNew = ($scope.currentEntity !== _entity);

			if ($scope.currentEntity) {
				$scope.stopTweens();
			}

			$scope.currentEntity = _entity;

			//TYPE
			if (_entity.type == Phaser.GROUP) {
				$scope.data.type = "group";
			} else if ( _entity.type == Phaser.TEXT) {
				$scope.data.type = "text";
			} else if ( _entity.type == Phaser.BITMAPTEXT) {
				$scope.data.type = "bitmaptext";
			} else if ( _entity.type == Phaser.TILESPRITE) {
				$scope.data.type = "tilesprite";
			} else if ( _entity.type == Phaser.BUTTON) {
				$scope.data.type = "button";
			} else {
				$scope.data.type = "sprite";
			}

			//position
			if( _entity.ed_fixedToCamera == true){
				$scope.data.entityX = _entity.cameraOffset.x;
				$scope.data.entityY = _entity.cameraOffset.y;
			}else{
				$scope.data.entityX = _entity.x;
				$scope.data.entityY = _entity.y;
			}
			
			//image
			if( $scope.data.type == "sprite" || $scope.data.type == "tilesprite" || $scope.data.type == "button"){	
				var key = $scope.currentEntity.key;
				//Atlas
				if( $scope.currentEntity.isAtlas == true ){
					$scope.selectAtlas(key,true);
					$scope.data.frameName = $scope.currentEntity.frameName;
				}

				if (key === "" || key === "__missing" || key == null) {
					$scope.data.image = $scope.noneImage;
				} 
				if (key !== "none") {
					var image = $scope.currentEntity.game.cache.getImage(key);
					$scope.data.image = image;
					$scope.data.imageKey = $scope.currentEntity.key;
				}
				$scope.data.imageFrame = $scope.currentEntity.frame;
			}

			//body
			if( (isNew || _forceBody==true) && $scope.currentEntity.body ){
				$scope.data.body.shapes = new Array();
				//Get shapes and store their data
				for(var i=0; i < $scope.currentEntity.go.getShapesCount(); i++){
					var data = $scope.currentEntity.go.getShapeData(i);
					var shape = $scope.currentEntity.go.getShape(i);
					var edDataShape = { 
						"x" : data.x , "y" : data.y, 
						"rotation" : data.rotation,
						"id":i
						};
					if(shape.ed_type == "rectangle"){
						edDataShape.width = data.width;
						edDataShape.height = data.height;
					}else if(shape.ed_type == "circle"){
						edDataShape.radius = data.radius;
					}
					$scope.data.body.shapes.push(edDataShape);
				}
				$scope.data.body.bindRotation = _entity.body.bindRotation;
			}
			//text
			if( $scope.data.type == 'text' ){
				$scope.data.text.value = _entity.text;
				$scope.data.text.fontSize = _entity.fontSize;
			}

		} else {
			this.resetData();
			console.error("entity is null");
		}
		//force select dropdowns refresh (needed for some reason)
		$timeout( $scope.forceImageDataRefreshNoApply,100);
	};

	$scope.forceImageDataRefreshNoApply = function(){
		//first, force image name
		var dropdownElmt = document.getElementById("selectKey");
		if(dropdownElmt!=null){
			for(var i=0; i< dropdownElmt.options.length; i++){
				if(dropdownElmt.options[i].text == $scope.data.imageKey){
					dropdownElmt.options[i].selected = true;
				}else{							
					dropdownElmt.options[i].selected = false;
				}
			}
		}
		//then force frame name if atlas
		if( $scope.currentEntity.isAtlas){
			dropdownElmt = document.getElementById("selectFrameName");
			if(dropdownElmt!=null){
				for(var i=0; i< dropdownElmt.options.length; i++){
					if(dropdownElmt.options[i].text == $scope.data.frameName){
						dropdownElmt.options[i].selected = true;
					}else{							
						dropdownElmt.options[i].selected = false;
					}
				}
			}
		}
	}

	$scope.clone = function() {
		$scope.$emit("cloneEntityEmit", {entity: $scope.currentEntity});
	}

	$scope.delete = function() {
		$scope.$emit("deleteEntityEmit", {entity: $scope.currentEntity});
	}

	$scope.setParent = function(_parent) {
		if (_parent != null) {
			var oldParent = $scope.currentEntity.parent;
			oldParent.remove($scope.currentEntity);
			_parent.add($scope.currentEntity);
			if( _parent.ed_outOfViewHide == true)
				$scope.toggleOutOfViewHide($scope.currentEntity,true);
		}
	};

	$scope.resetData = function(){
		$scope.data = {
			newBehaviour: "",
			image: $scope.noneImage,
			imageFrame: 0,
			images: new Array(),
			body : {shapes : []}
		};
	}

	$scope.revertPrefab = function(){
		$scope.$emit("revertPrefabEmit", { entity : $scope.currentEntity});
	}

	$scope.savePrefab = function(){
		$scope.$emit("openPrefabsModalEmit", { entity : $scope.currentEntity});
	}

	//================================================================
	//						BEHAVIOURS
	//================================================================

	$scope.deleteBehaviour = function(_behaviour) {
		if (_behaviour) {
			var behaviours = $scope.currentEntity.behaviours;
			var i=0;
			var found = false;
			while (i<behaviours.length && found == false) {
				var b = behaviours[i];
				if (b.name === _behaviour.name) {
					behaviours.splice(i, 1);
				}
				i++;
			}
		}
	};

	$scope.addBehaviour = function(_behaviour) {

		if ($scope.currentEntity) {
			if (_behaviour != null) {

				if($scope.currentEntity.behaviours == null) {
					$scope.currentEntity.behaviours = new Array();
				}
				// _behaviour is a string
				try {
					var clone = JSON.parse(_behaviour);
					clone.enabled = true;
					$scope.currentEntity.behaviours.push(clone);
				} catch (e) {
					console.error(e);
				}
			}
		}
	};

	$scope.removeAllBehaviours = function() {
		if ($scope.currentEntity) {
			$scope.currentEntity.behaviours = new Object();
		}
	};

	//================================================================
	//						DISPLAY
	//================================================================

	$scope.changeTexture = function(_imageKey, _frame) {
		if( $scope.currentEntity == null)
			return;

		if (_frame == null || _frame === "") {
			_frame = 0;
		}

		var image = $scope.currentEntity.game.cache.getImage(_imageKey);
		if (image) {
			var lastTexture = $scope.currentEntity.key;
			$scope.currentEntity.loadTexture(_imageKey,parseInt(_frame));
			$scope.currentEntity.frame = ( parseInt(_frame) );

			//tweak > phaser has issues refreshing the texture with tilesprites
			//that's a bit harsh but the PIXI.texture is okay after first loading so no other solution was found
			if( $scope.data.type == "tilesprite"){
				$timeout(
					function(){
						$scope.currentEntity.loadTexture(_imageKey);					
					}
				,100);				
			}
			if( lastTexture == "none"){
				//search image data
				var imageData = null;
				for(var i=0; i < $scope.project.assets.images.length; i++){
					if( $scope.project.assets.images[i].name == _imageKey ){
						imageData = $scope.project.assets.images[i];
						break;
					}
				}
				//Set widt/height with the image data
				if( imageData != null){
					$scope.currentEntity.width = parseInt(imageData.frameWidth);
					$scope.currentEntity.height = parseInt(imageData.frameHeight);
				}
			}
		} else {
			console.error("No image with the name '" + _imageKey +"'' in cache");
		}
	};

	$scope.changeTextureButton = function(_imageKey) {
		var image = $scope.currentEntity.game.cache.getImage(_imageKey);
		if (image) {
			var lastTexture = $scope.currentEntity.key;
			$scope.currentEntity.loadTexture(_imageKey, 0);
			$scope.currentEntity.setFrames(
				parseInt($scope.currentEntity.onOverFrameID),
				parseInt($scope.currentEntity.onOutFrameID),
				parseInt($scope.currentEntity.onDownFrameID),
				parseInt($scope.currentEntity.onUpFrameID)
			);
			if(lastTexture == "none") {
				$scope.currentEntity.width = parseInt(image.frameWidth);
				$scope.currentEntity.height = parseInt(image.frameHeight);
			}
		} else {
			console.error("No image with the name '" + image +"'' in cache");
		}
	};

	$scope.changeTint = function(){
		var stringColor = "0x"+$scope.currentEntity.ed_tintColor.substring(1); 
		$scope.currentEntity.tint = stringColor;
	}

	$scope.changeDepth = function(_value){
		if( $scope.currentEntity ){
			if( _value < 0 ){
				$scope.currentEntity.parent.moveDown($scope.currentEntity);
			}else{
				$scope.currentEntity.parent.moveUp($scope.currentEntity);
			}
		}
	}

	$scope.toggleVisible = function(){
		if( $scope.currentEntity ){
			$scope.currentEntity.visible = ! $scope.currentEntity.visible;
		}
	}

	$scope.toggleLock = function(_lock){
		if( $scope.currentEntity && $scope.currentEntity.type != Phaser.GROUP ){
			$scope.currentEntity.ed_locked = _lock;
			if( $scope.currentEntity.ed_locked)
				$scope.$emit("lockEntityEmit",{ entity : $scope.currentEntity});
			else
				$scope.currentEntity.go.sendMessage("unlock");
		}
	}

	$scope.toggleFixedToCamera = function(){
		if( $scope.currentEntity && $scope.currentEntity.ed_fixedToCamera ){
			$scope.$emit("fixEntityToCameraEmit",{entity : $scope.currentEntity});
		}else{
			var bh = $scope.currentEntity.go.getBehaviour(LR.Editor.Behaviour.EntityCameraFixer);
			if( bh ){
				bh.enabled = false;
			}
		}
	}

	$scope.toggleOutOfViewHide = function(_entity,_value){
		//you can change an entity ed_outOfViewHide property inside a group
		//which has an ed_outOfViewHide property set to true
		if(_entity.parent.ed_outOfViewHide == true){
			_entity.ed_outOfViewHide = true;
			if( _value == null)
				return;
			else
				_value = true;
		}
		if( _value != null)
			_entity.ed_outOfViewHide = _value;
		if( _entity.children && _entity.ed_outOfViewHide == true){
			for(var i=0; i < _entity.children.length; i++){
				$scope.toggleOutOfViewHide(_entity.children[i],_entity.ed_outOfViewHide);
			}
		}
	}

	//============ ATLAS ==============================
	$scope.changeAtlas = function(_atlas,_frameName) {
		$scope.currentEntity.loadTexture(_atlas);
		$scope.currentEntity.frameName = _frameName;
		$scope.currentEntity.isAtlas = true;
	}

	$scope.selectAtlas = function(_atlasName,_force){
		if( $scope.currentEntity.key == _atlasName && _force != true)
			return;
		for(var i=0; i < $scope.data.atlases.length; i++){
			if( _atlasName == $scope.data.atlases[i].name){
				$scope.data.atlas = $scope.data.atlases[i];
				$scope.data.frameName = Object.keys($scope.data.atlas.frames)[0];
			}
		}
	}
	//============ ANIMATION =============================

    $scope.addAnimToCurrentEntity = function(_name){
    	if(_name == null || _name =="")
    		return;
    	var newAnim = $scope.currentEntity.animations.add(_name);
    	newAnim.ed_frames = "[ 0 ]";
    	newAnim._frames = [0];
    }

    $scope.removeAnim = function(_anim){
    	if(_anim == null)
    		return;
    	var anims = $scope.currentEntity.animations._anims;
    	if( anims.hasOwnProperty(_anim.name)){
    		delete anims[_anim.name];
    	}
    	if( Object.keys(anims).length == 0){
    		$scope.currentEntity.autoPlayActive = false;
    		$scope.currentEntity.autoPlay = null;
    	}
    }

    $scope.changeAnim = function(_anim){
    	var jsonAnim = null;
    	try{
    		jsonAnim = JSON.parse(_anim.ed_frames) ;
    	}catch(e){
   			return;
    	}
    	_anim._frames = jsonAnim;
    	if( _anim.isPlaying)
    		$scope.playAnim(_anim);
    }

    $scope.playAnim = function(_anim){
    	$scope.currentEntity.ed_frameBeforeAnim = $scope.currentEntity.frame;
    	$scope.currentEntity.animations.play(_anim.name);
    }

    $scope.stopAnim = function(_anim){
    	$scope.currentEntity.animations.stop(_anim.name);
    	$scope.currentEntity.frame = $scope.currentEntity.ed_frameBeforeAnim;
    }

    $scope.changeAutoPlay = function(){
    	if(Object.keys($scope.currentEntity.animations._anims).length==0){
    		$scope.currentEntity.autoPlayActive = false;
    	}
    	if( $scope.currentEntity.autoPlay == null)
    		$scope.currentEntity.autoPlay = {
    			name : Object.keys($scope.currentEntity.animations._anims)[0], 
    			speed : 10, loop : true 
    		};
    }

    //================= TWEENS ======================================

    $scope.addTween = function(_tweenName){
    	if( _tweenName == null)
    		_tweenName = "tween" + (Object.keys($scope.currentEntity.go.tweensData).length + 1);
    	var tween = new Object();
    	tween.name = _tweenName;
    	tween.properties = "{}";
    	tween.duration = 1000;
    	tween.easing = ["Linear","None"]; tween.delay = 0;
    	tween.repeat = 0; tween.yoyo = false;
    	tween.relative = false; tween.autoStart = false;
    	$scope.currentEntity.go.addTween(tween);
    }

    $scope.copyTween = function(_tween){
    	$scope.__copiedTween =JSON.parse( JSON.stringify(_tween.data));
    }

    $scope.pasteTween = function(_tweenName){
    	if($scope.__copiedTween == null )
    		return;
    	var newTween = JSON.parse( JSON.stringify($scope.__copiedTween));
    	if( _tweenName == null)
    		_tweenName = $scope.__copiedTween.name;
    	$scope.currentEntity.go.addTween(newTween);
    }

    $scope.removeTween = function(_name){
    	if( $scope.currentEntity.go.tweensData.hasOwnProperty(_name))
    		delete $scope.currentEntity.go.tweensData[_name];
    }

    $scope.playTween = function(_name){
    	//Get tween and convert its properties
    	var tween = $scope.currentEntity.go.tweensData[_name].data;
    	var props = null;
    	try{
    		props = JSON.parse(tween.properties);
    	}catch(e){
    		console.error("Invalid JSON properties");
    	}
    	$scope.currentEntity.ed_launchedTweens = new Array();
    	//Go throught all properties and launch tweens 
    	for(var key in props){
	    	var targetData = LR.Utils.getPropertyByString($scope.currentEntity,key);
	    	var createdTween = $scope.currentEntity.game.add.tween( targetData.object );
	    	var newProp = {};
	    	newProp[targetData.property] = props[key];
	    	//process relativeness (?). If a tween is marked as relative, the movement on x & y will be computed from the gameobject's current position
			if( tween.relative == true ){
				newProp[targetData.property] += targetData.object[targetData.property];
			}
			//Repeating
			if( tween.repeat < 0)
				tween.repeat = Number.MAX_VALUE;
			else
				createdTween.onComplete.add(this.onTweenComplete,this);
			var easing = Phaser.Easing[tween.easing[0]][tween.easing[1]];
	    	createdTween.to(newProp, tween.duration, easing,
	    					 false,tween.delay, 
	    					 tween.repeat +(tween.yoyo?1:0), 
	    					 tween.yoyo);
	    	//keep trace of tween and base properties
	    	createdTween.baseProp = {"object":targetData.object,"property":targetData.property,
	    							"baseValue":targetData.object[targetData.property]};
	    	$scope.currentEntity.ed_launchedTweens.push(createdTween);
	    	//Start tween
	    	createdTween.start();
	    }
    }
    //Stop all tweens of the current entity
    $scope.stopTweens = function(){
    	if( $scope.currentEntity.ed_launchedTweens == null)
    		return;
    	var tween = null;
    	for(var i=0; i < $scope.currentEntity.ed_launchedTweens.length; i ++){
    		tween = $scope.currentEntity.ed_launchedTweens[i];
    		if( tween == null )
    			continue;
    		tween.baseProp.object[tween.baseProp.property] = tween.baseProp.baseValue;
    		tween.stop();
    	}
    	tween = $scope.currentEntity.ed_launchedTweens = new Array();
    }

    $scope.onTweenComplete = function(_entity){
    	var tween = null;
    	for(var i=0; i < _entity.ed_launchedTweens.length; i ++){
    		tween = _entity.ed_launchedTweens[i];
    		if( tween == null || tween.isRunning )
    			continue;
    		tween.baseProp.object[tween.baseProp.property] = tween.baseProp.baseValue;
    		tween.stop();
    		_entity.ed_launchedTweens.splice(i,1);
    		break;
    	}
    }

    $scope.onEasingChanged = function(_tweenData){
    	_tweenData.easing[1] = $scope.tweenTypes[_tweenData.easing[0]][0];
    }

	//================================================================
	//						SOUNDS
	//================================================================

	$scope.addSound = function(_name){
		if( $scope.currentEntity.ed_sounds == null )
			$scope.currentEntity.ed_sounds = new Array();
		if( _name == null || _name == "" ) 
			_name = "sound"+ $scope.currentEntity.ed_sounds.length;
		var dataSound = {name:_name, key:"",
						autoPlay:false, loop:true, volume:1,
						is3D : false, volumeMax3D : 1, distance3D : 300
						};

		$scope.currentEntity.ed_sounds.push(dataSound);
	}

	$scope.removeSound = function(_index){
    	$scope.currentEntity.ed_sounds.splice(_index,1);
    }
	//================================================================
	//						BODY
	//================================================================

	$scope.addBodyToCurrentEntity = function(){
		if( $scope.currentEntity && $scope.currentEntity.go ){
			
			//P2 crash when adding a body onto a sprite with scales < 0
			//so we need a workaround. we'll temporarily change its scale beforce adding the body
			var scale = { x : $scope.currentEntity.scale.x, y : $scope.currentEntity.scale.y};
			if( scale.x < 0 ) $scope.currentEntity.scale.x *= -1;
			if( scale.y < 0 ) $scope.currentEntity.scale.y *= -1;

			$scope.currentEntity.go.enablePhysics(Phaser.Physics.P2.Body.DYNAMIC);

			//Rescale after sprite workaround
			$scope.currentEntity.scale.x = scale.x; $scope.currentEntity.scale.y = scale.y;
	
			$scope.currentEntity.go.enableSensor();
			$scope.currentEntity.body.debug = true;

			$scope.currentEntity.body.ed_enabled = true;
			$scope.currentEntity.body.ed_motion = "DYNAMIC";
			$scope.currentEntity.body.ed_debugEditor = true;

			$scope.currentEntity.go.getShape().lr_name = "mainShape";
			$scope.currentEntity.go.getShape().ed_type = "rectangle";
			//move group of the debug body in the editor group ( preventing from exporting it )
			$scope.$emit("moveEntityToEditorEmit",{ entity : $scope.currentEntity.body.debugBody});
			
			$scope.refreshCurrentEntity($scope.currentEntity,true);
		}
	};

	$scope.removeBodyFromCurrentEntity = function(){
		if( $scope.currentEntity && $scope.currentEntity.go ){
			$scope.currentEntity.go.removePhysics();
			$scope.currentEntity.body = null;
			$scope.refreshCurrentEntity($scope.currentEntity,true);
		}
	};

	$scope.toggleBodyDebug = function(){
		if( $scope.currentEntity.body ){
			if($scope.currentEntity.body.debugBody != null){
				$scope.currentEntity.body.debug = false;
			}else{
				$scope.currentEntity.body.debug = true;
				//move group of the debug body in the editor group ( preventing from exporting it )
				$scope.$emit("moveEntityToEditorEmit",{ entity : $scope.currentEntity.body.debugBody});
			}
		}
	}

	$scope.resizeBody = function(){
		if( $scope.currentEntity && $scope.currentEntity.body ){
			var newShape = $scope.currentEntity.body.setRectangle(
					$scope.data.body.width, $scope.data.body.height,
					$scope.data.body.x, $scope.data.body.y,
					LR.Utils.toRadians($scope.data.body.rotation)
				);
			newShape.sensor = true;
			newShape.ed_type = "rectangle";
		}
	}

	$scope.addShapeToCurrentEntity = function(_name){
		if( $scope.currentEntity && $scope.currentEntity.body ){
			if( _name == null ||_name == "" )
				_name = "shape"+ ( $scope.currentEntity.go.getShapesCount() - 1 );

			var newShape = $scope.currentEntity.body.addRectangle($scope.currentEntity.width,$scope.currentEntity.height);
			newShape.mass = 0;
			newShape.sensor = true;
			newShape.lr_name = _name;
			newShape.ed_type = "rectangle";
			$scope.refreshCurrentEntity($scope.currentEntity,true);
			$scope.shapeName = "";
		}
	}

	$scope.resizeShape = function(_index){
		if( $scope.currentEntity && $scope.currentEntity.body ){
			var oldShape = this.currentEntity.go.getShape(_index);
			var formerEdSensor = oldShape.ed_sensor;
			var formerType = oldShape.ed_type;
			var shape = null;
			if( oldShape.ed_type == "rectangle" )
				shape = $scope.currentEntity.go.replaceShapeByRectangle(_index, $scope.data.body.shapes[_index] );		
			else if(oldShape.ed_type == "circle")
				shape =  $scope.currentEntity.go.replaceShapeByCircle(_index, $scope.data.body.shapes[_index] );
			shape.sensor = true;
			shape.ed_sensor = formerEdSensor;
			shape.ed_type = formerType;

			//Resize sprite if none
			if( $scope.currentEntity.key == "none"){
				if( oldShape.ed_type == "rectangle" ){
					$scope.currentEntity.width = $scope.data.body.shapes[0].width;
					$scope.currentEntity.height = $scope.data.body.shapes[0].height;
				}else if( oldShape.ed_type == "circle"){
					$scope.currentEntity.width = $scope.data.body.shapes[0].radius * 2;
					$scope.currentEntity.height = $scope.data.body.shapes[0].radius * 2;
				}
			}
		}
	}

	$scope.resetShape = function(_index,_type){
		if( $scope.currentEntity && $scope.currentEntity.body ){
			//phaser P2 bodies dont work with scales < 0
			var oldScale = new Phaser.Point($scope.currentEntity.scale.x,$scope.currentEntity.scale.y);
			$scope.currentEntity.scale.set(1);
			//get shape type
			if(_type == null)
				_type = $scope.currentEntity.go.getShape(_index).ed_type;
			var dataShape = { "x" : 0, "y" : 0, "rotation": 0};
			var shape = null;
			if(_type == "rectangle" || _type == null){
				dataShape.width = $scope.currentEntity.width * oldScale.x; 
				dataShape.height = $scope.currentEntity.height * oldScale.y;
				shape = $scope.currentEntity.go.replaceShapeByRectangle(_index, dataShape );		
			}else if( _type == "circle"){
				dataShape.radius = $scope.currentEntity.width > $scope.currentEntity.height ? $scope.currentEntity.width*0.5:$scope.currentEntity.height*0.5;
				shape = $scope.currentEntity.go.replaceShapeByCircle(_index, dataShape );
			}
			shape.sensor = true;
			shape.ed_type = _type;
			console.log(_type);
			$scope.currentEntity.scale = oldScale;
			$scope.refreshCurrentEntity($scope.currentEntity,true);
		}
	}

	$scope.deleteShape = function(_index){
		if( $scope.currentEntity && $scope.currentEntity.body && $scope.currentEntity.go.getShapesCount() > 1){
			$scope.currentEntity.body.removeShape($scope.currentEntity.go.getShape(_index));
			$scope.currentEntity.body.shapeChanged();
			$scope.refreshCurrentEntity($scope.currentEntity,true);
		}
	}

	$scope.bindRotation = function() {
		$scope.currentEntity.body.bindRotation = $scope.data.body.bindRotation;
	}
	//=========================================================
	//					TEXT
	//=========================================================

	$scope.changeText = function( _text ){

	}

	$scope.changeFont = function( ){
		var font = $scope.currentEntity.fontWeight + " "
				+ $scope.currentEntity.fontSize + "px "
				+ $scope.currentEntity.fontName;
		var style = $scope.currentEntity.style;
		style.font = font;
		$scope.currentEntity.setStyle(style);
	}

	$scope.changeMaxCharPerLine = function(){
		
	}

	$scope.containsSearchWord = function(_name,_searchWord){
	    if( _searchWord == null || _searchWord == "" || _name == null )
	      return true;
	    if( _name.toUpperCase().indexOf(_searchWord.toUpperCase()) >= 0)
	      return true;
	    return false;
    }

	//=========================================================
	//					MODALS
	//=========================================================
	/*
	* Opens the Edit Modal. At validation, this will modify the _textVarName varialbe of the _textContext
	*/
	$scope.openEditModal = function(_textContext, _textVarName, _isLong) {
   		$scope.$emit("openEditModalEmit", { context : _textContext, varName : _textVarName, isLong : _isLong});
	};

	$scope.openBehaviourArgsModal = function(_behaviour) {

		// we need args as an object, but it is stored as a string
		$scope.modalParamsData.behaviour = _behaviour;
		$scope.modalParamsData.game = $scope.currentEntity.game;
		
		var modalInstance = $modal.open({
			scope: $scope,
			templateUrl: 'partials/modals/behaviour_args_modal.html',
			controller: BehaviourArgsCtrlModal,
			resolve: {
			}
		});

		modalInstance.result.then(function (_data) {
		}, function () {
			// clean modal data
			console.info('Modal dismissed at: ' + new Date());
		});
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

	main();
}]);