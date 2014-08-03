"use strict";

/**
* ImporterEntity class
*
* @namespace Importer
* @class ImporterEntity
* @constructor
*/
LR.Importer.ImporterEntity = function() {
	LR.Importer.call(this);
};

LR.ImporterEntity.Sprite.prototype = Object.create(LR.Importer.prototype);
LR.ImporterEntity.Sprite.prototype.constructor = LR.ImporterEntity.Sprite;

LR.Importer.ImporterEntity.prototype.import = function(_game, _data, _entity) {
	LR.Importer.prototype.import.call(this);

	// import root entity first
	_entity = this.setGeneral(_data, _entity);
	_entity = this.setDisplay(_data, _entity);
	_entity = this.setPhysics(_data, _entity);
	_entity = this.setBehaviours(_data, _entity);

	// then, import children
	if (_data.children != null) {
		for (var i = 0; i < _data.children.length; i++) {
			var child = _data.children[i];
			var cChild = this.importEntities(child, _game);
			if( _entity == null ){
				console.log("Parent is null");
			} else if (cChild) {
				_entity.add(cChild);
			}
		};
	}

	return _entity;
};

LR.Importer.ImporterEntity.prototype.setGeneral = function(_data, _entity) {
	_entity.name = _data.name;
	_entity.go.name = _data.name;
	_entity.x = _data.x;
	_entity.y = _data.y;
	_entity.angle = _data.angle;
	
	if( _data.scaleX && _data.scaleY){
		_entity.scale.x = _data.scaleX;
		_entity.scale.y = _data.scaleY;
	}
};

LR.Importer.ImporterEntity.prototype.setDisplay = function(_data, _entity) {
	_entity.visible = _data.visible;
	_entity.alpha = _data.alpha || 1;

	if (_data.key) {
		var w = _entity.width;
		var h = _entity.height;
		_entity.loadTexture(_data.key, _data.frame);
		_entity.width = w;
		_entity.height = h;
	}

	//tint color
	if( _data.tint != null ){
		_entity.tint = _data.tint;
	}

	//Animations
	if( _data.anims){
		for( var key in _data.anims){
			var newAnim = _entity.animations.add(
				key,
				_data.anims[key].frames,
				_data.anims[key].speed,
				_data.anims[key].loop
			);
		}
	}
};

/*
* Adds a body to the entity with the data provided by objectData and creates all shapes
*/
LR.Importer.ImporterEntity.prototype.setPhysics = function(_data, _entity) {
	_entity.go.layer = _data.layer;

	var motionState = Phaser.Physics.P2.Body.DYNAMIC;
	if (_data.body.motion === "STATIC"){
		motionState = Phaser.Physics.P2.Body.STATIC;
	} else if( _data.body.motion === "KINEMATIC"){
		motionState = Phaser.Physics.P2.Body.KINEMATIC;
	}
	_entity.go.enablePhysics(motionState);

	//adding a body has prevented us from setting the position directly to the sprite
	_entity.body.x = _data.x;
	_entity.body.y = _data.y;

	_entity.body.fixedRotation = _data.body.fixedRotation;
	_entity.body.angle = _data.body.angle;
	_entity.body.data.gravityScale = _data.body.gravity;
	_entity.body.data.mass = _data.body.mass;

	// go through the shapes data and create real shapes
	for( var i=0; i < _data.body.shapes.length ; i++){
		var shapeData = _data.body.shapes[i];
		//this will replace a shape or replace the current one
		var newShape = _entity.go.replaceShapeByRectangle(i, shapeData);		
		newShape.sensor = shapeData.sensor;
		newShape.lr_name = shapeData.name;
	}
};

LR.Importer.ImporterEntity.prototype.setBehaviours = function(_data, _entity) {
	_entity.behaviours = jQuery.extend(true, [], _data.behaviours);
};