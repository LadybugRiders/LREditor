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
			img.name, img.path, img.frameWidth, img.frameHeight);
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
* @return the root of all entities
*/
LR.LevelImporter.prototype.importEntitiesAndDo = function(_objects, _game, _promise) {
	var root = this.importEntities(_objects, _game);

	this.doAfterImportEntitiesAndBeforePromise(_objects, _game);
	
	if (typeof _promise === "function") {
		_promise(root, _game);
	}

};

/**
* Import all entities
*
* @method importEntities
* @param {Object} Objects Entities informations
* @param {Phaser.Game} game The game where entities will be imported
*/
LR.LevelImporter.prototype.importEntities = function(_object, _game) {
	var entity = null;
	if (_object.name === "__world") {
		// do nothing (already created by Phaser)
		entity = _game.world;
		entity.setBounds(0, 0, _object.width, _object.height);
	} else {
		entity = this.importEntity(_object, _game);
	}

	if (_object.children != null) {
		for (var i = 0; i < _object.children.length; i++) {
			var child = _object.children[i];
			var cChild = this.importEntities(child, _game);
			if( entity == null ){
				console.log("Parent is null");
			}else if (cChild) {
				entity.add(cChild);
			}
		};
	}

	return entity;
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

		this.setGeneral(_object, entity);

		this.setDisplay(_object, entity);

		if (_object.body) {
			this.setPhysics(_object, entity);
		}

		this.setBehaviours(_object, entity);

		this.setTweens(_object, entity);
	}

	//ANCHOR
	if( _object.anchor ){
		entity.anchor.setTo(_object.anchor.x , _object.anchor.y);
	} 

	return entity;
};

LR.LevelImporter.prototype.setGeneral = function(_objectData, _entity) {
	_entity.name = _objectData.name;
	_entity.go.name = _objectData.name;
	_entity.x = _objectData.x;
	_entity.y = _objectData.y;
	_entity.angle = _objectData.angle;

	/*if( _objectData.anchor ){
		console.log(_objectData.anchor);
		_entity.anchor.setTo(_objectData.anchor.x , _objectData.anchor.y);
		console.log(_entity.anchor);
	} */
	
	if( _objectData.scaleX && _objectData.scaleY){
		_entity.scale.x = _objectData.scaleX;
		_entity.scale.y = _objectData.scaleY;
	}

	if(		_objectData.type == "LR.Entity.Sprite"
		||	_objectData.type == "LR.Entity.TileSprite"
		||	_objectData.type == "LR.Entity.Button"
	) {
		_entity.width = _objectData.width;
		_entity.height = _objectData.height;
	}  
	if(_objectData.type == "LR.Entity.Text"){
		if (_objectData.textData) {
			_entity.text = _objectData.textData.text;
			//Reset width after font settings are filled
			_entity.updateTransform();
		}
	}
};

LR.LevelImporter.prototype.setDisplay = function(_objectData, _entity) {
	_entity.visible = _objectData.visible;
	_entity.alpha = _objectData.alpha || 1;

	if (_objectData.key) {
		var w = _entity.width;
		var h = _entity.height;
		_entity.loadTexture(_objectData.key, _objectData.frame);
		_entity.width = w;
		_entity.height = h;
	}

	if(_objectData.type == "LR.Entity.Button"){
		_entity.setFrames(
			_objectData.onOverFrameID,
			_objectData.onOutFrameID,
			_objectData.onDownFrameID,
			_objectData.onUpFrameID
		);
	}

	//tint color
	if( _objectData.tint != null ){
		_entity.tint = _objectData.tint;
	}

	//Animations
	if( _objectData.anims){
		for( var key in _objectData.anims){
			var newAnim = _entity.animations.add(
				key,
				_objectData.anims[key].frames,
				_objectData.anims[key].speed,
				_objectData.anims[key].loop
			);
		}
	}
};

/*
* Adds a body to the entity with the data provided by objectData and creates all shapes
*/
LR.LevelImporter.prototype.setPhysics = function(_objectData, _entity) {
	_entity.go.layer = _objectData.layer;

	var motionState = Phaser.Physics.P2.Body.DYNAMIC;
	if (_objectData.body.motion === "STATIC"){
		motionState = Phaser.Physics.P2.Body.STATIC;
	} else if( _objectData.body.motion === "KINEMATIC"){
		motionState = Phaser.Physics.P2.Body.KINEMATIC;
	}
	_entity.go.enablePhysics(motionState);

	//adding a body has prevented us from setting the position directly to the sprite
	_entity.body.x = _objectData.x;
	_entity.body.y = _objectData.y;

	_entity.body.fixedRotation = _objectData.body.fixedRotation;
	_entity.body.angle = _objectData.body.angle;
	_entity.body.data.gravityScale = _objectData.body.gravity;
	_entity.body.data.mass = _objectData.body.mass;

	// go through the shapes data and create real shapes
	for( var i=0; i < _objectData.body.shapes.length ; i++){
		var shapeData = _objectData.body.shapes[i];
		//this will replace a shape or replace the current one
		var newShape = _entity.go.replaceShapeByRectangle(i, shapeData);		
		newShape.sensor = shapeData.sensor;
		newShape.lr_name = shapeData.name;
	}
};

LR.LevelImporter.prototype.setBehaviours = function(_objectData, _entity) {
	_entity.behaviours = jQuery.extend(true, [], _objectData.behaviours);
};

LR.LevelImporter.prototype.setTweens = function(_objectData, _entity) {};