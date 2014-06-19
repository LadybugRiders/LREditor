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
};

LR.Editor.LevelImporterEditor.prototype.importEntity = function(_object, _game) {
	//set key to none if null
	if(_object.key == null && 
		( _object.type == LR.LevelUtilities.TYPE_SPRITE ||_object.type == LR.LevelUtilities.TYPE_TILESPRITE)
		)
		_object.key = "none";

	var entity = LR.LevelImporter.prototype.importEntity.call(this, _object, _game);

	//add input behaviour on sprites /text
	if( entity.type != Phaser.GROUP ){
		entity.go.addBehaviour(new LR.Editor.Behaviour.EntityInputHandler(entity.go, this.$scope));
	}

	//Lock
	if( _object.locked ){
		entity.ed_locked = true;
		this.$scope.lockEntity(entity);
	}else{
		entity.ed_locked = false;
	}

	//Fixed to Camera
	if( _object.fixedToCamera == true ){
		entity.ed_fixedToCamera = true;
		this.$scope.fixEntityToCamera(entity,true);
	}else{
		entity.ed_fixedToCamera = false;
	}

	return entity;
}

/*
* Adds a body to the entity with the data provided by objectData
*/
LR.Editor.LevelImporterEditor.prototype.setBody = function(_objectData,_entity){
	//force dynamic ( we won't be able to move the entity otherwise )
	_entity.go.enablePhysics(Phaser.Physics.P2.Body.DYNAMIC);
	//Call base method
	LR.LevelImporter.prototype.setBody.call(this,_objectData,_entity);
	//Enable sensor ( we don't want our entities to collide in the editor )
	_entity.go.enableSensor();

	//EDITOR SPECIFIC STUFF
	_entity.body.ed_motion = _objectData.body.motion;
	_entity.body.ed_sensor = _objectData.body.sensor;
	_entity.body.ed_enabled = _objectData.body.enabled;
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
}