"use strict";

// get module LREditor.controllers
var LREditorCtrlMod = angular.module('LREditor.controllers');

// create controller LoginCtrol in the module LREditor.controllers
LREditorCtrlMod.controller('AttributesCtrl', ["$scope", "$http","$modal", "$timeout",
	function($scope, $http,$modal, $timeout) {
	function main() {
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

		$scope.modalArgsData = {
			args : {}
		};

		$scope.modalParamsData = {
		};

		$scope.$on("sendImagesBroadcast", function(_event, _args) {
			if (_args.images) {
				$scope.data.images = _args.images
			}
		});

		$scope.$on("sendBehavioursBroadcast", function(_event, _args) {
			if (_args.behaviours) {
				$scope.data.behaviours = _args.behaviours;
			}
		});

		$scope.$on("refreshCurrentEntityBroadcast", function(_event, _args) {
			if( _args.phaser == true ){
				$scope.refreshCurrentEntityFromPhaser(_args.entity,_args.forceBodyRefresh);
			}else{
				$scope.refreshCurrentEntity(_args.entity,_args.forceBodyRefresh);
			}
		});

		$scope.$on("sendLayersBroadcast", function(_event, _args) {
			$scope.layers = _args.layers;
		});
	};

	//================================================================
	//						GENERAL
	//================================================================

	$scope.setX = function(_x){
		if( $scope.currentEntity && $scope.currentEntity.go){
			if( $scope.currentEntity.ed_fixedToCamera){
				$scope.currentEntity.cameraOffset.x = _x;
			}else{				
				$scope.currentEntity.go.setX(_x);
			}
		}
	};

	$scope.setY = function(_y){
		if( $scope.currentEntity && $scope.currentEntity.go ){
			if( $scope.currentEntity.ed_fixedToCamera){
				$scope.currentEntity.cameraOffset.y = _y;
			}else{				
				$scope.currentEntity.go.setY(_y);
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
				$scope.currentEntity.drawBounds = false;
			}

			$scope.currentEntity = _entity;

			//TYPE
			if (_entity.type == Phaser.GROUP) {
				$scope.data.type = "group";
			} else if ( _entity.type == Phaser.TEXT) {
				$scope.data.type = "text";
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
			if( $scope.data.type == "sprite"){
				var key = $scope.currentEntity.key;
				if (key === "" || key === "__missing" || key == null) {
					$scope.data.image = $scope.noneImage;
				} if (key !== "none") {
					var image = $scope.currentEntity.game.cache.getImage(key);
					$scope.data.image = image;
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
						"width" : data.width, "height" : data.height,
						"rotation" : data.rotation,
						"id":i
						};
					$scope.data.body.shapes.push(edDataShape);
				}
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
	};

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

				try {
					var clone = JSON.parse(JSON.stringify(_behaviour));
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

	$scope.changeTexture = function(_image, _frame) {
		if (typeof _image !== "object") {
			_image = new Image();
		}
		if (_image.name == null || _image.name === "") {
			_image.name = null;
		}

		if (_frame == null || _frame === "") {
			_frame = 0;
		}

		if ($scope.currentEntity.game.cache.getImage(_image.name)) {
			var lastTexture = $scope.currentEntity.key;
			$scope.currentEntity.loadTexture(_image.name);
			$scope.currentEntity.frame = ( parseInt(_frame) );
			if( lastTexture == "none"){
				$scope.currentEntity.width = parseInt(_image.frameWidth);
				$scope.currentEntity.height = parseInt(_image.frameHeight);
			}
		} else {
			console.error("No image with the name '" + _image.name +"'' in cache");
		}
	};

	$scope.changeTextureButton = function(_image) {
		if (typeof _image !== "object") {
			_image = new Image();
		}
		if (_image.name == null || _image.name === "") {
			_image.name = null;
		}

		if ($scope.currentEntity.game.cache.getImage(_image.name)) {
			var lastTexture = $scope.currentEntity.key;
			$scope.currentEntity.loadTexture(_image.name, 0);
			$scope.currentEntity.setFrames(
				parseInt($scope.currentEntity.onOverFrameID),
				parseInt($scope.currentEntity.onOutFrameID),
				parseInt($scope.currentEntity.onDownFrameID),
				parseInt($scope.currentEntity.onUpFrameID)
			);
			if(lastTexture == "none") {
				$scope.currentEntity.width = parseInt(_image.frameWidth);
				$scope.currentEntity.height = parseInt(_image.frameHeight);
			}
		} else {
			console.error("No image with the name '" + _image.name +"'' in cache");
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

	//================================================================
	//						BODY
	//================================================================

	$scope.addBodyToCurrentEntity = function(){
		if( $scope.currentEntity && $scope.currentEntity.go ){
			//console.log("AddBody");
			$scope.currentEntity.go.enablePhysics(Phaser.Physics.P2.Body.DYNAMIC);
			$scope.currentEntity.go.enableSensor();
			$scope.currentEntity.body.debug = true;

			$scope.currentEntity.body.ed_enabled = true;
			$scope.currentEntity.body.ed_motion = "DYNAMIC";
			$scope.currentEntity.body.ed_debugEditor = true;

			$scope.currentEntity.go.getShape().lr_name = "mainShape";
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
			$scope.refreshCurrentEntity($scope.currentEntity,true);
			$scope.shapeName = "";
		}
	}

	$scope.resizeShape = function(_index){
		if( $scope.currentEntity && $scope.currentEntity.body ){
			var formerEdSensor = this.currentEntity.go.getShape(_index).ed_sensor;
			var shape = $scope.currentEntity.go.replaceShapeByRectangle(_index, $scope.data.body.shapes[_index] )		
			shape.sensor = true;
			shape.ed_sensor = formerEdSensor;

			//Resize sprite if none
			if( $scope.currentEntity.key == "none"){
				$scope.currentEntity.width = $scope.data.body.shapes[0].width;
				$scope.currentEntity.height = $scope.data.body.shapes[0].height;
			}
		}
	}

	$scope.resetShape = function(_index){
		if( $scope.currentEntity && $scope.currentEntity.body ){
			var dataShape = { 
						"x" : 0, "y" : 0, 
						"width" : $scope.currentEntity.width, "height" : $scope.currentEntity.height,
						"rotation" : 0
						};
			var shape = $scope.currentEntity.go.replaceShapeByRectangle(_index, dataShape )		
			shape.sensor = true;
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

	//=========================================================
	//					TEXT
	//=========================================================

	$scope.changeText = function( _text ){

	}

	$scope.changeFont = function( _fontName ){
		var font = $scope.currentEntity.fontWeight + " "
				+ $scope.currentEntity.fontSize + "px "
				+ $scope.currentEntity.fontName;
		var style = $scope.currentEntity.style;
		style.font = font;
		$scope.currentEntity.setStyle(style);
		//$scope.currentEntity.updateTransform();
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