"use strict";

/**
* Export a level.
*
* @namespace LR
* @class LevelExporter
* @constructor
*/
LR.LevelExporter = function() {

};

/**
* Export all the level.
*
* @method export
* @param {Phaser.Game} game The game of the level
* @return {Object} exported level
*/
LR.LevelExporter.prototype.export = function(_game,_dataSettings,_cutscenes) {
	var level = new Object();

	level.assets = this.exportAssets(_game.cache);
	level.objects = this.exportEntities(_game.world);
	if( _dataSettings )
		level.settings = _dataSettings;
	level.cutscenes = _cutscenes;

	return level;
};

/***********
** ASSETS **
***********/

/**
* Export all the level's assets.
*
* @method exportAssets
* @param {Phaser.Cache} cache The game's cache of the level
* @return {Object} exportable level's assets
*/
LR.LevelExporter.prototype.exportAssets = function(_cache) {
	var assets = new Object();

	assets.images = this.exportImages(_cache);

	return assets;
};

/***********
** IMAGES **
***********/

/**
* Export all the level's images.
*
* @method exportImages
* @param {Phaser.Cache} cache The game's cache of the level
* @return {Object} exportable level's images
*/
LR.LevelExporter.prototype.exportImages = function(_cache) {
	var images = new Array();

		var keys = _cache.getKeys(Phaser.Cache.IMAGE);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var cachedImage = _cache.getImage(key);
			var frame = _cache.getFrameByIndex(key, 0);
			var image = this.exportImage(cachedImage, frame);
			if (LR.LevelUtilities.IsEditorImage(image) == false) {
				images.push(image);
			}
		};

		return images;
};

/**
* Export a cached image into an exportable image.
*
* @method exportImage
* @param {Image} cachedImage The cached image
* @param {Phaser.Frame} frame The default frame of the image
* @return {Object} exportable level's images
*/
LR.LevelExporter.prototype.exportImage = function(_cachedImage, _frame) {
	var image = new Object();

	image.name = _cachedImage.name;
	image.src = _cachedImage.getAttribute("src");
	image.width = _cachedImage.width;
	image.height = _cachedImage.height;
	if (_frame) {
		image.frameWidth = _frame.width;
		image.frameHeight = _frame.height;
	}

	return image;
};

/************
** OBJECTS **
************/

/**
* Export all the level's entities.
*
* @method exportEntities
* @param {Phaser.Group | GameObject} entity The entity object
* @return {Phaser.Group | GameObject} the exported entity and its descendants
*/
LR.LevelExporter.prototype.exportEntities = function(_entity) {
	var eObjects = null;

	//don't export editor's entities
	if (_entity.name) {
		if (_entity.name === "__world"
			|| (_entity.name[0] == "_" && _entity.name[1] == "_") == false) {
			// export parent
			eObjects = this.exportEntity(_entity);

			// if parent has children
			if (_entity.children.length > 0) {
				eObjects.children = new Array();
				for (var i=0; i<_entity.children.length; i++) {
					var child = _entity.children[i];
					// export child
					var obj = this.exportEntities(child);
					// add exported child
					if (obj != null) {
						eObjects.children.push(obj);
					}
				}
			}
		}
	}
	
	return eObjects;
};

/**
* Export all the level's entities.
*
* @method exportEntity
* @param {LR.Entity} entity The object to export
* @return {LR.Entity} the exported object
*/
LR.LevelExporter.prototype.exportEntity = function(_entity) {
	var eObj = new Object();

	eObj = this.setGeneral(_entity, eObj);

	eObj = this.setDisplay(_entity, eObj);
	
	//body
	if (_entity.body) {
		eObj = this.setPhysics(_entity, eObj);
	}

	eObj = this.setBehaviours(_entity, eObj);

	return eObj;
};

LR.LevelExporter.prototype.setGeneral = function(_entity, _object) {
	_object.type = LR.LevelUtilities.GetType(_entity);

	_object.name = _entity.name;
	_object.x = _entity.x;
	_object.y = _entity.y;
	_object.angle = _entity.angle;

	if(_entity.ed_locked == true) {
		_object.locked = true;
	}	

	if(_entity.type !== "LR.Entity.Text" ) {
		_object.width = _entity.width;
		_object.height = _entity.height;
	} else {
		_object.textData = {
			text : _entity.text,
			style : {
				font : _entity.style.font,
				fill : _entity.style.fill
			}
		};

		//stroke thickness
		if( _entity.strokeThickness > 0){
			_object.textData.style.strokeThickness = _entity.strokeThickness;
			_object.textData.style.stroke = _entity.stroke;
		}
		//wrap
		if( _entity.wordWrap ){
			_object.textData.style.wordWrap = true;
			_object.textData.style.wordWrapWidth = _entity.wordWrapWidth;
		}
	}

	return _object
};

LR.LevelExporter.prototype.setDisplay = function(_entity, _object) {
	_object.visible = _entity.visible;

	//set key to null if none
	if (_entity.key && _entity.key != "none") {
		_object.key = _entity.key;
		_object.frame = _entity.frame;
	}

	//fixedToCamera
	if (_entity.ed_fixedToCamera == true) {
		_object.fixedToCamera = true;
		_object.x = _entity.cameraOffset.x;
		_object.y = _entity.cameraOffset.y;
	}

	return _object;
};

LR.LevelExporter.prototype.setPhysics = function(_entity, _object) {
	_object.layer = _entity.go.layer;

	_object.body = new Object();
	_object.body.motion = _entity.body.ed_motion;
	_object.body.enabled = _entity.body.ed_enabled;
	_object.body.fixedRotation = _entity.body.fixedRotation;
	_object.body.angle = _entity.body.angle;
	_object.body.debug = _entity.body.ed_debugEditor;

	//export shapes
	_object.body.shapes = new Array();
	for(var i=0; i < _entity.go.getShapesCount(); i++){
		var data = _entity.go.getShapeData(i);
		var shape = _entity.go.getShape(i);
		_object.body.shapes.push( { 
			"x" : data.x , "y" : data.y, 
			"width" : data.width, "height" : data.height,
			"rotation" : data.rotation,
			"name": shape.lr_name, "id":i,
			"sensor": shape.ed_sensor
			} 
		);
	}

	return _object;
};

LR.LevelExporter.prototype.setBehaviours = function(_entity, _object) {
	_object.behaviours = _entity.behaviours;

	return _object;
};
