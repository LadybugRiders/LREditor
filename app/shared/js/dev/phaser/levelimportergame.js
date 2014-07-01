"use strict";

/**
* Import a level for a game.
*
* @namespace LR
* @class LevelImporterGame
* @constructor
*/
LR.LevelImporterGame = function() {
	LR.LevelImporter.call(this);
};

LR.LevelImporterGame.prototype = Object.create(LR.LevelImporter.prototype);
LR.LevelImporterGame.prototype.constructor = LR.LevelImporterGame;

LR.LevelImporterGame.prototype.import = function(_level, _game, _promise) {
	LR.LevelImporter.prototype.import.call(this,_level,_game,_promise);
	
	if (_game.cutsceneManager) {
		_game.cutsceneManager.loadCutscenes( _level.cutscenes );
	}

	//Place Camera
	if (_level.settings) {
		_game.camera.bounds = null;
		_game.camera.x = _level.settings.camera.x;
		_game.camera.y = _level.settings.camera.y;
	}
};

LR.LevelImporterGame.prototype.doAfterImportEntitiesAndBeforePromise = function(_objects, _game) {
	LR.LevelImporter.prototype.doAfterImportEntitiesAndBeforePromise.call(this, _objects, _game);
	this.callBehavioursCreate(_game);
};

LR.LevelImporterGame.prototype.importEntity = function(_object, _game) {
	
	var entity = LR.LevelImporter.prototype.importEntity.call(this, _object, _game);

	// Add GameObject to the state. Don't add to game. Events are on.
	_game.state.getCurrentState().addGameObject(entity.go, false, true);

	return entity;
};

LR.LevelImporterGame.prototype.setGeneral = function(_objectData, _entity) {
	LR.LevelImporter.prototype.setGeneral.call(this, _objectData, _entity);

	if(_objectData.fixedToCamera) {
		_entity.fixedToCamera = true;
	}
};

LR.LevelImporterGame.prototype.setPhysics = function(_objectData,_entity) {
	//Call base method
	LR.LevelImporter.prototype.setPhysics.call(this, _objectData, _entity);
	
	if( _objectData.body.debug)
		_entity.body.debug = true;
}

LR.LevelImporterGame.prototype.setBehaviours = function(_objectData, _entity) {
	LR.LevelImporter.prototype.setBehaviours.call(this, _objectData, _entity);

	if (_entity.behaviours) {
		if (_entity.behaviours.length > 0) {
			for (var i = 0; i < _entity.behaviours.length; i++) {
				var behaviour = _entity.behaviours[i];
				var behaviourClass = behaviour.classname;

				var classes = behaviourClass.split(".");

				var Class = null;
				for( var i = 0 ; i < classes.length ; i++){
					var curClassName = classes[i];
					if(Class == null){
						Class = (window || this)[curClassName];
					} else{
						Class = Class[curClassName];
					}
				}

				if (Class) {
					var args = JSON.parse(behaviour.args);
					var behaviour = _entity.go.addBehaviour( new Class(_entity.go) );
					behaviour.args_create = args;
				} else {
					console.error(
						"LR.LevelImporterGame - Unkown behaviour: " + behaviourClass);
				}
			};
		}
	}
};

LR.LevelImporterGame.prototype.callBehavioursCreate = function(_game) {
	// call behaviours create for every gameobjects
	var gameobjects = _game.state.getCurrentState().gameobjects;

	for(var i=0; i < gameobjects.length ; i ++){
		var go = gameobjects[i];

		for(var j=0; j < go.behaviours.length; j++ ){
			var bh = go.behaviours[j];
			bh.create(bh.args_create);		
			bh.args_create = null;	
		}
	}
};