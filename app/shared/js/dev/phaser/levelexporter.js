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
LR.LevelExporter.prototype.export = function(_game, _project, _dataSettings,_cutscenes) {
	var level = new Object();

	level.assets = this.exportAssets(_game, _project);
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
LR.LevelExporter.prototype.exportAssets = function(_game, _project) {
	var assets = new Object();

	assets.images = this.exportImages(_game, _project);
	assets.behaviours = this.exportBehaviours(_game, _project);

	return assets;
};

/***********
** IMAGES **
***********/

/**
* Export all the level's images.
*
* @method exportImages
* @param {Phaser.World} level's world
* @return {Array} level's images
*/
LR.LevelExporter.prototype.exportImages = function(_game, _project) {
	var keys = new Array();

	keys = this.getImageKeys(_game.world, keys);

	var images = this.getExportableImages(_game.cache, keys);
	console.log(images);

	return images;
};

/**
* Return the image keys of the entities and its children.
*
* @method getImages
* @param {LR.Entity} entity
* @return {Array} image keys
*/
LR.LevelExporter.prototype.getImageKeys = function(_entity, _keys) {
	if (_entity.key) {
		if (_keys.indexOf(_entity.key) < 0) {
			_keys.push(_entity.key);
		}
	}

	if (_entity.children != null) {
		for (var i = 0; i < _entity.children.length; i++) {
			var child = _entity.children[i];
			_keys = this.getImageKeys(child, _keys);
		};
	}

	return _keys;
};

/**
* Export all the level's images.
*
* @method exportImages
* @param {Phaser.Cache} cache The game's cache of the level
* @return {Array} level's image keys
* @return {Array} exportable level's images
*/
LR.LevelExporter.prototype.getExportableImages = function(_cache, _keys) {
	var images = new Array();

	for (var i = 0; i < _keys.length; i++) {
		var key = _keys[i];
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

/***************
** BEHAVIOURS **
***************/

/**
* Export all the level's behaviours.
*
* @method exportBehaviours
* @param {Phaser.Game} game
* @param {Object} project data
* @return {Array} level's behaviours
*/
LR.LevelExporter.prototype.exportBehaviours = function(_game, _project) {
	var behaviours = new Array();

	behaviours = this.getBehaviours(_game.world, behaviours);

	behaviours = this.addPathToExportedBehaviours(behaviours, _project.assets.behaviours);

	return behaviours;
};

/**
* Return the behaviours of the entities and its children.
*
* @method getBehaviours
* @param {LR.Entity} entity
* @return {Array} behaviours
*/
LR.LevelExporter.prototype.getBehaviours = function(_entity, _behaviours) {
	if (_entity.behaviours) {
		_behaviours = this.mergeBehaviours(_entity.behaviours, _behaviours);
	}

	if (_entity.children != null) {
		for (var i = 0; i < _entity.children.length; i++) {
			var child = _entity.children[i];
			_behaviours = this.getBehaviours(child, _behaviours);
		};
	}

	return _behaviours;
};

/**
* Return a merge array of behaviours (no doublons).
*
* @method mergeBehaviours
* @param {LR.Entity} first group of behaviours
* @param {LR.Entity} second group of behaviours
* @return {Array} behaviours
*/
LR.LevelExporter.prototype.mergeBehaviours = function(_behaviours1, _behaviours2) {
	var behaviours = new Array();
	behaviours = behaviours.concat(_behaviours2);

	for (var i = 0; i < _behaviours1.length; i++) {
		var behaviour = _behaviours1[i];

		var j = 0;
		var found = false;
		while (j < _behaviours2.length && found == false) {
			if (behaviour.name == _behaviours2[j]) {
				found = true;
			}

			j++;
		}

		if (found == false) {
			behaviours.push(behaviour);
		}
	};

	return behaviours;
};

/**
* Add project path to exported behaviours.
*
* @method addPathToExportedBehaviours
* @param {Array} exported behaviours
* @return {Array} All behaviours with full data
*/
LR.LevelExporter.prototype.addPathToExportedBehaviours = function(_exportedBehaviours, _behavioursData) {
	for (var i = 0; i < _exportedBehaviours.length; i++) {
		var behaviour = _exportedBehaviours[i];

		var j = 0;
		var found = false;
		while (j < _behavioursData.length && found == false) {
			var data = _behavioursData[j];
			if (data.name == behaviour.name) {
				behaviour.path = data.path;

				found = true;
			}

			j++;
		}
	};

	return _exportedBehaviours;
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
	if( _entity.go )
		_object.id = _entity.go.id;
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
	_object.body.gravity = _entity.body.data.gravityScale;
	_object.body.mass = _entity.body.data.mass;
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
	_object.behaviours = jQuery.extend(true, [],_entity.behaviours);

	return _object;
};
