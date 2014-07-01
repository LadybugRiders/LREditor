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
	var entity = LR.LevelImporter.prototype.importEntity.call(this, _object, _game);

	return entity;
};

LR.Editor.LevelImporterEditor.prototype.setDisplay = function(_objectData, _entity){
	LR.LevelImporter.prototype.setDisplay.call(this, _objectData, _entity);

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