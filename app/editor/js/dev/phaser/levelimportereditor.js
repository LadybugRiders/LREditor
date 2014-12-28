"use strict";

/**
* Import a level in the editor
*
* @namespace Editor
* @class LevelImporterEditor
* @constructor
*/
LR.Editor.LevelImporterEditor = function(_$scope) {
	LR.LevelImporter.call(this);
	this.$scope = _$scope;
};

LR.Editor.LevelImporterEditor.prototype = Object.create(LR.LevelImporter.prototype);
LR.Editor.LevelImporterEditor.prototype.constructor = LR.Editor.LevelImporterEditor;

LR.Editor.LevelImporterEditor.prototype.import = function(_level, _game, _promise) {
	LR.LevelImporter.prototype.import.call(this,_level,_game,_promise);
	this.$scope.cutscenes = _level.cutscenes;
	this.$scope.settings = _level.settings;
	if(_level.prefabName){
		this.prefab = { name : _level.prefabName, path : _level.prefabPath};
	}
};

/**
* Import all the images
*
* @method importImages
* @param {Object} images Images informations
* @param {Phaser.Loader} loader The loader used to import images
*/
LR.Editor.LevelImporterEditor.prototype.importImages = function(_images, _loader) {
	for (var i = 0; i < _images.length; i++) {
		var imgData = _images[i];

		var imgPath = this.$scope.project.path + "/assets/images" + imgData.path;

		_loader.spritesheet(
			imgData.name, imgPath,
			parseInt(imgData.frameWidth), parseInt(imgData.frameHeight)
		);

		var projectImage = this.getProjectImageByName(imgData.name);

		if (projectImage) {
			projectImage.frameWidth = imgData.frameWidth;
			projectImage.frameHeight = imgData.frameHeight;
			projectImage.loaded = true;
		} else {
			console.warn("image '" + imgData.name + "' loaded but not linked with the editor.");
		}
	};
};

LR.Editor.LevelImporterEditor.prototype.getProjectImageByName = function(_name) {
	var projectImage = null;

	var projectImages = this.$scope.project.assets.images;

	var i = 0;
	var found = false;
	while (i<projectImages.length && found == false) {
		var img = projectImages[i];$
		
		if (img.name == _name) {
			projectImage = img;
			found = true;
		}

		i++;
	}

	return projectImage;
};

//===================== ATLASES ========================

LR.Editor.LevelImporterEditor.prototype.importAtlases = function(_atlases, _loader) {
	if(_atlases == null)
		return;
	for (var i = 0; i < _atlases.length; i++) {
		var atData = _atlases[i];
		var atPath = this.$scope.project.path + "/assets/atlases" + atData.path;

		_loader.atlas(
			atData.name, atPath+".png", atPath+".json"
		);
		_loader.json(atData.name, atPath+".json");

		var projectImage = this.getProjectAtlasByName(atData.name);
		if (projectImage) {
			projectImage.loaded = true;
		} else {
			console.warn("image '" + atData.name + "' loaded but not linked with the editor.");
		}
	}
	//Create a function that will fill the frames data of each atlas
	//at the end of the loading
	_loader.onLoadComplete.add(this.getAtlasesFrames,this);
};

LR.Editor.LevelImporterEditor.prototype.getProjectAtlasByName = function(_name) {
	var projectAtlas = null;

	var projectAtlases = this.$scope.project.assets.atlases;

	var i = 0;
	var found = false;
	while (i<projectAtlases.length && found == false) {
		var img = projectAtlases[i];
		if (img.name == _name) {
			projectAtlas = img;
			found = true;
		}

		i++;
	}

	return projectAtlas;
};

LR.Editor.LevelImporterEditor.prototype.getAtlasesFrames = function() {
	var atlases = this.$scope.project.assets.atlases;
	for(var i=0; i < atlases.length; i++){
		if( atlases[i].loaded){
			atlases[i].frames = this.$scope.game.cache.getJSON(atlases[i].name).frames;
		}
	}

	this.$scope.game.load.onLoadComplete.remove(this.getAtlasesFrames);
};

//======================================================

LR.Editor.LevelImporterEditor.prototype.importEntity = function(_object, _game) {
	var entity = LR.LevelImporter.prototype.importEntity.call(this, _object, _game);
	//we want to know which is the higher ID. this is the perfect place
	if( this.$scope.ID_count < entity.go.id ){
		this.$scope.ID_count = entity.go.id;
	}
	//if this.prefab exists, we are currently importing a prefab
	if( this.prefab ){
		entity.prefab = this.prefab;
		this.prefab = null;
	//else if the imported object contains a prefab property
	}else if(_object.prefab){
		entity.prefab = _object.prefab;
	}
	return entity;
};

LR.Editor.LevelImporterEditor.prototype.setDisplay = function(_objectData, _entity){
	LR.LevelImporter.prototype.setDisplay.call(this, _objectData, _entity);
	//Out Of View Hide
	_entity.outOfViewHide = false; //Deactivate this to prevent sprite from disapearing in the editor
	if( _objectData.outOfViewHide == true ){
		_entity.ed_outOfViewHide = true;
	}
	//set key to none if null
	if(_objectData.key == null && 
		( _objectData.type == LR.LevelUtilities.TYPE_SPRITE ||_objectData.type == LR.LevelUtilities.TYPE_TILESPRITE)
		) {
		var w = _entity.width;
		var h = _entity.height;
		_entity.loadTexture("none", _objectData.frame);
		_entity.width = w;
		_entity.height = h;
	}

	//Lock
	if (_objectData.locked) {
		_entity.ed_locked = true;
		this.$scope.lockEntity(_entity);
	} else {
		_entity.ed_locked = false;
	}

	//Fixed to Camera
	if (_objectData.fixedToCamera == true) {
		_entity.ed_fixedToCamera = true;
		this.$scope.fixEntityToCamera(_entity, true);
	} else {
		_entity.ed_fixedToCamera = false;
	}

	//autoscroll for tilesprites
	if(_objectData.type == "LR.Entity.TileSprite"){
		if( _objectData.scrollX != null)
			_entity.scrollX = _objectData.scrollX;

		if( _objectData.scrollY != null)
			_entity.scrollY = _objectData.scrollY;
	}

	// Button specifics
	if( _objectData.type == "LR.Entity.Button") {
		// frames
		_entity.onOverFrameID = parseInt(_objectData.onOverFrameID);
		_entity.onOutFrameID = parseInt(_objectData.onOutFrameID);
		_entity.onDownFrameID = parseInt(_objectData.onDownFrameID);
		_entity.onUpFrameID = parseInt(_objectData.onUpFrameID);
	}

	//tint color
	if( _objectData.tint != null && typeof _objectData.tint == 'string' ){	
		_entity.ed_tintColor = "#"+_objectData.tint.substring(2); 
	}

	//animations
	if( _entity.animations && _entity.animations._anims !== {}){
		var entityAnims = _entity.animations._anims;
		for( var key in entityAnims){
			//for edition, we need the array as a string
			entityAnims[key].ed_frames = JSON.stringify(entityAnims[key]._frames);
			entityAnims[key].loop = _objectData.anims[key].loop;
			entityAnims[key].speed = _objectData.anims[key].speed;
		}
		_entity.autoPlayAnim = _objectData.autoPlayAnim;
		_entity.autoPlayActive = (_entity.autoPlayAnim != null);
	}
};

/*
* Adds a body to the entity with the data provided by objectData
*/
LR.Editor.LevelImporterEditor.prototype.setPhysics = function(_objectData, _entity){
	//force dynamic ( we won't be able to move the entity otherwise )
	//_entity.go.enablePhysics(Phaser.Physics.P2.Body.DYNAMIC);
	//Call base method
	LR.LevelImporter.prototype.setPhysics.call(this, _objectData, _entity);

	_entity.go.motionState = Phaser.Physics.P2.Body.DYNAMIC;
	//Enable sensor ( we don't want our entities to collide in the editor )
	_entity.go.enableSensor();

	//EDITOR SPECIFIC STUFF
	_entity.body.ed_motion = _objectData.body.motion;
	_entity.body.ed_sensor = _objectData.body.sensor;
	_entity.body.ed_enabled = _objectData.body.enabled;
	//deactivate fixedrotation for editor
	_entity.body.ed_fixedRotation = _entity.body.fixedRotation;
	_entity.body.fixedRotation = false;
	//Debug Bodies
	_entity.body.ed_debugEditor = _objectData.body.debug;
	if( _objectData.body.debug == true ){
		_entity.body.debug = true;
		//move group of the debug body in the editor group ( preventing from exporting it )
		this.$scope.$emit("moveEntityToEditorEmit",{ entity : _entity.body.debugBody});
	}

	for(var i=0; i < _entity.go.getShapesCount(); i++){
		var shape = _entity.go.getShape(i);
		shape.ed_sensor = _objectData.body.shapes[i].sensor;
	}
};

LR.Editor.LevelImporterEditor.prototype.setBehaviours = function(_objectData, _entity) {
	LR.LevelImporter.prototype.setBehaviours.call(this, _objectData, _entity);
	
	//add input behaviour on sprites /text
	if (_entity.type != Phaser.GROUP) {
		_entity.go.addBehaviour(new LR.Editor.Behaviour.EntityInputHandler(_entity.go, this.$scope));
	}
};

LR.Editor.LevelImporterEditor.prototype.setTweens = function(_objectData, _entity) {
	if( _objectData.tweens != null ){
		var tweens = JSON.parse( JSON.stringify(_objectData.tweens)) ;
		for(var key in tweens){
			_entity.go.tweensData[key] = {data:tweens[key],
										chained : tweens[key].chain != null};
		}
	}
};

LR.Editor.LevelImporterEditor.prototype.setSounds = function(_objectData, _entity) {
	if( _objectData.sounds != null )
		_entity.ed_sounds = jQuery.extend(true, [], _objectData.sounds);
};