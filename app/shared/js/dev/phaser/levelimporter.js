"use strict";

/**
* Import a level.
*
* @namespace LR
* @class LevelImporter
* @constructor
*/
LR.LevelImporter = function() {

};

/**
* Import all the level.
*
* @method import
* @param {Object} level The level to import
* @param {Phaser.Game} game The game where the level will be imported
* @param {function} promise A promise
*/
LR.LevelImporter.prototype.import = function(_level, _game, _promise) {
	var loader = new Phaser.Loader(_game);
	this.importAssets(_level.assets, loader, _game);
	// if assets need to be loaded
	if (loader.totalQueuedFiles() > 0) {
		loader.start();
		loader.onLoadComplete.add(function() {
			// now assets are loaded, we can import entities
			this.importEntitiesAndDo(_level.objects, _game, _promise);
		}, this);	
	} else {
		// directly create object
		this.importEntitiesAndDo(_level.objects, _game, _promise);
	}
};

/***********
** ASSETS **
***********/

/**
* Import all the assets (images, sounds, etc...)
*
* @method importAssets
* @param {Object} assets Assets informations
* @param {Phaser.Loader} loader The loader used to import assets
*/
LR.LevelImporter.prototype.importAssets = function(_assets, _loader) {
	this.importImages(_assets.images, _loader);
};

/***********
** IMAGES **
***********/

/**
* Import all the images
*
* @method importImages
* @param {Object} images Images informations
* @param {Phaser.Loader} loader The loader used to import images
*/
LR.LevelImporter.prototype.importImages = function(_images, _loader) {
	for (var i = 0; i < _images.length; i++) {
		var img = _images[i];
		_loader.spritesheet(
			img.name, img.src, img.frameWidth, img.frameHeight);
	};
};

/************
** ENTITIES **
************/

/**
* Import all entities and do the promise
*
* @method importEntitiesAndDo
* @param {Object} objects Entities informations
* @param {Phaser.Game} game The game where entities will be imported
* @param {function} promise A promise
*/
LR.LevelImporter.prototype.importEntitiesAndDo = function(_objects, _game, _promise) {
	var world = this.importEntities(_objects, _game);

	this.doAfterImportEntitiesAndBeforePromise(_objects, _game);
	
	if (typeof _promise === "function") {
		_promise(null, _game);
	}
};

/**
* Import all entities
*
* @method importEntities
* @param {Object} Objects Entities informations
* @param {Phaser.Game} game The game where entities will be imported
*/
LR.LevelImporter.prototype.importEntities = function(_parent, _game) {
	var cParent = null;
	if (_parent.name === "__world") {
		// do nothing (already created by Phaser)
		cParent = _game.world;
		cParent.setBounds(0, 0, _parent.width, _parent.height);
	} else {
		cParent = this.importEntity(_parent, _game);
	}

	if (_parent.children != null) {
		for (var i = 0; i < _parent.children.length; i++) {
			var child = _parent.children[i];
			var cChild = this.importEntities(child, _game);
			if( cParent == null ){
				console.log("Parent is null");
			}else if (cChild) {
				cParent.add(cChild);
			}
		};
	}

	return cParent;
}

/**
* Override this method to do something between the entities importation and
* the promise
*
* @method doAfterImportEntitiesAndBeforePromise
* @param {Object} objects Entities informations
* @param {Phaser.Game} game The game where entiites will be imported
*/
LR.LevelImporter.prototype.doAfterImportEntitiesAndBeforePromise = function(_object, _game) {

};

/**
* Import an entity
*
* @method importEntity
* @param {Object} object Entity informations
* @param {Phaser.Game} game The game where entities will be imported
*/
LR.LevelImporter.prototype.importEntity = function(_object, _game) {
	var entity = LR.LevelUtilities.CreateEntityByType(_object, _game);

	if (entity) {
		for (var i = 0; i < LR.LevelUtilities.OBJECT_ATTRIBUTES.length; i++) {
			var attr = LR.LevelUtilities.OBJECT_ATTRIBUTES[i];
			
			entity[attr] = _object[attr];
		};

		entity.go.name = _object.name;
		entity.go.layer = _object.layer;

		if (entity.key) {
			// we have to use "_object.frame" because entity.frame is always null
			// if no texture is set
			var w = entity.width;
			var h = entity.height;
			entity.loadTexture(entity.key, _object.frame);
			entity.width = w;
			entity.height = h;
		}

		if( entity.body ){
			this.setBody(_object,entity);
		}
	}

	return entity;
}

/*
* Adds a body to the entity with the data provided by objectData and creates all shapes
*/
LR.LevelImporter.prototype.setBody = function(_objectData,_entity){
	//adding a body has prevented us from setting the position directly to the sprite
	_entity.body.x = _objectData.x;
	_entity.body.y = _objectData.y;

	_entity.body.fixedRotation = _objectData.body.fixedRotation;
	_entity.body.angle = _objectData.body.angle;

	// go through the shapes data and create real shapes
	for( var i=0; i < _objectData.body.shapes.length ; i++){
		var shapeData = _objectData.body.shapes[i];
		//this will replace a shape or replace the current one
		var newShape = _entity.go.replaceShapeByRectangle(i,shapeData);		
		newShape.sensor = shapeData.sensor;
		newShape.lr_name = shapeData.name;
	}
}