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
* @param {Phaser.Group | GameObject} parent The parent object
* @return {Phaser.Group | GameObject} the exported parent and its descendants
*/
LR.LevelExporter.prototype.exportEntities= function(_parent) {
	var eObjects = null;

	//don't export editor's entities
	if (_parent.name !== "__editor") {
		// export parent
		eObjects = this.exportEntity(_parent);

		// if parent has children
		if (_parent.children.length > 0) {
			eObjects.children = new Array();
			for (var i=0; i<_parent.children.length; i++) {
				var child = _parent.children[i];
				// export child
				var obj = this.exportEntities(child);
				// add exported child
				if (obj != null) {
					eObjects.children.push(obj);
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

	eObj.type = LR.LevelUtilities.GetType(_entity);

	if(eObj.type == "" || eObj.type == null){
		console.log("Type wasn't found for ");
		console.log(_entity);
	}
	//general
	for (var i = 0; i < LR.LevelUtilities.OBJECT_ATTRIBUTES.length; i++) {
		var attr = LR.LevelUtilities.OBJECT_ATTRIBUTES[i];
		//Don't export these for Text
		if(_entity.type == "LR.Entity.Text" ){
				if( attr == "width" || attr == "height"){
					continue;
				}
			} 	
		eObj[attr] = _entity[attr];
	};
	//add locked properties only if it's set to true
	if( _entity.ed_locked == true ){
		eObj.locked = true;
	}	
	//fixedToCamera
	if( _entity.ed_fixedToCamera == true ){
		eObj.fixedToCamera = true;
		eObj.x = _entity.cameraOffset.x;
		eObj.y = _entity.cameraOffset.y;
	}
	//set key to null if none
	if(eObj.key == "none")
		eObj.key = null;
	//body
	if( _entity.body ){
		eObj.body = new Object();
		eObj.body.motion = _entity.body.ed_motion;
		eObj.body.enabled = _entity.body.ed_enabled;
		eObj.body.fixedRotation = _entity.body.fixedRotation;
		eObj.body.angle = _entity.body.angle;
		eObj.body.debug = _entity.body.ed_debugEditor;
		//export shapes
		eObj.body.shapes = new Array();
		for(var i=0; i < _entity.go.getShapesCount(); i++){
			var data = _entity.go.getShapeData(i);
			var shape = _entity.go.getShape(i);
			eObj.body.shapes.push( { 
				"x" : data.x , "y" : data.y, 
				"width" : data.width, "height" : data.height,
				"rotation" : data.rotation,
				"name": shape.lr_name, "id":i,
				"sensor": shape.ed_sensor
				} 
			);
		}
	}
	//Text
	if( _entity.type == Phaser.TEXT){
		
		eObj.textData = {
			text : _entity.text,
			style : {
				font : _entity.style.font,
				fill : _entity.style.fill
			}
		};
		//stroke thickness
		if( _entity.strokeThickness > 0){
			eObj.textData.style.strokeThickness = _entity.strokeThickness;
			eObj.textData.style.stroke = _entity.stroke;
		}
		//wrap
		if( _entity.wordWrap ){
			eObj.textData.style.wordWrap = true;
			eObj.textData.style.wordWrapWidth = _entity.wordWrapWidth;
		}
	}
	return eObj;
};
