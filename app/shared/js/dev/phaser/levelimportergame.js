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
	this.debugBodiesInGame = _level.settings.debugBodiesInGame;

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

LR.LevelImporterGame.prototype.importAssets = function(_assets, _loader) {
	LR.LevelImporter.prototype.importAssets.call(this, _assets, _loader);

	this.importSounds(_assets.sounds, _loader);
	this.importBehaviours(_assets.behaviours, _loader);
	this.importBitmapFonts(_assets.bitmapFonts,_loader);
};

/**
* Import all the images
*
* @method importImages
* @param {Object} images Images informations
* @param {Phaser.Loader} loader The loader used to import images
*/
LR.LevelImporterGame.prototype.importImages = function(_images, _loader) {
	for (var i = 0; i < _images.length; i++) {
		var img = _images[i];

		var imgPath = "assets/images" + img.path;

		_loader.spritesheet(
			img.name, imgPath,
			parseInt(img.frameWidth), parseInt(img.frameHeight)
		);
	};
};

LR.LevelImporterGame.prototype.importSounds = function(_sounds, _loader) {
	for(var i=0; i < _sounds.length; i ++){
		_loader.audio( _sounds[i].name,"assets/audios" + _sounds[i].path);
	}
}


LR.LevelImporterGame.prototype.importBitmapFonts = function(_bitmapFonts, _loader) {
	if( _bitmapFonts == null)
		return;
	for(var i=0; i < _bitmapFonts.length; i ++){
		_loader.bitmapFont( _bitmapFonts[i].name,"assets/fonts" + _bitmapFonts[i].path, 
							"assets/fonts" + _bitmapFonts[i].pathData);
	}
}

/**
* Import all the behaviours
*
* @method importBehaviours
* @param {Object} behaviours Behaviours informations
* @param {Phaser.Loader} loader The loader used to import behaviours
*/
LR.LevelImporterGame.prototype.importBehaviours = function(_behaviours, _loader) {
	for (var i = 0; i < _behaviours.length; i++) {
		var behaviour = _behaviours[i];
		_loader.script(behaviour.name, "assets/behaviours" + behaviour.path);
	};
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

LR.LevelImporterGame.prototype.setDisplay = function(_objectData, _entity) {
	LR.LevelImporter.prototype.setDisplay.call(this, _objectData, _entity);
	//auto scroll for tilesprites
	if (_objectData.type == "LR.Entity.TileSprite") {
		if ( _objectData.scrollX != null)
			_entity._scroll.x = _objectData.scrollX;

		if ( _objectData.scrollY != null)
			_entity._scroll.y = _objectData.scrollY;
	}
	//animation autoplay
	if (_objectData.autoPlayAnim != null) {
		_entity.animations.play(_objectData.autoPlayAnim);
	}
};

LR.LevelImporterGame.prototype.setPhysics = function(_objectData,_entity) {
	//Call base method
	LR.LevelImporter.prototype.setPhysics.call(this, _objectData, _entity);
	
	if( this.debugBodiesInGame && _objectData.body.debug)
		_entity.body.debug = true;
}

LR.LevelImporterGame.prototype.setBehaviours = function(_objectData, _entity) {
	if (_objectData.behaviours) {
		if (_objectData.behaviours.length > 0) {
			for (var i = 0; i < _objectData.behaviours.length; i++) {
				var bhData = _objectData.behaviours[i];
				if (bhData.name) {
					var behaviourClass = bhData.name;

					var classes = behaviourClass.split(".");

					var Class = null;
					
					for (var j = 0 ; j < classes.length ; j++){
						var curClassName = classes[j];
						if (Class == null) {
							Class = (window || this)[curClassName];
						} else {
							Class = Class[curClassName];
						}
					}

					if (Class) {
						var bhInstance = _entity.go.addBehaviour(new Class(_entity.go));
						//keep args for the create() of behaviours, done later
						bhInstance.args_create = bhData.params;
					} else {
						console.error(
							"LR.LevelImporterGame - Unkown behaviour: " + behaviourClass);
					}
				}
			};
		}
	}
};

LR.LevelImporterGame.prototype.setTweens = function(_objectData, _entity) {
	if( _objectData.tweens != null ){
		var tweens = JSON.parse( JSON.stringify(_objectData.tweens)) ;
		for(var i=0; i < tweens.length; i ++){
			//Get tween and convert its properties
	    	var tween = tweens[i];
	    	var props = null;
	    	try{
	    		props = JSON.parse(tween.properties);
	    	}catch(e){
	    		console.error("Invalid JSON properties");
	    	}
	    	//Go throught all properties and launch tweens in editor
	    	for(var key in props){
		    	var targetData = LR.Utils.getPropertyByString(_entity,key);
		    	var createdTween = _entity.game.add.tween( targetData.object );
		    	var newProp = {};
		    	newProp[targetData.property] = props[key];
		    	//process relativeness (?). If a tween is marked as relative, the movement on x & y will be computed from the gameobject's current position
				if( tween.relative == true ){
					newProp[targetData.property] += targetData.object[targetData.property];
				}
				//console.log(tween);
				if( tween.repeat < 0)
					tween.repeat = Number.MAX_VALUE;
		    	createdTween.to(newProp, tween.duration, null, true,tween.delay, tween.repeat - 1, tween.yoyo);
		    }
		}
	}
};

LR.LevelImporterGame.prototype.setSounds = function(_objectData, _entity) {
	if( _objectData.sounds != null ){
		for(var i=0; i < _objectData.sounds.length; i++){
			var data = _objectData.sounds[i];
			var sound = _entity.game.add.audio(data.key);
			if( sound ){
				_entity.go.addSound(data.name,sound);
				if( data.autoPlay == true)
					_entity.go.playSound(data.name,1,data.loop);
			}
		}
	}
}

LR.LevelImporterGame.prototype.callBehavioursCreate = function(_game) {
	// call behaviours create for every gameobjects
	var gameobjects = _game.state.getCurrentState().gameobjects;

	for(var i=0; i < gameobjects.length ; i ++){
		var go = gameobjects[i];

		for(var j=0; j < go.behaviours.length; j++ ){
			var bh = go.behaviours[j];
			bh = this.processBehaviourArgs(_game,bh);
			bh.create(bh.args_create);		
			bh.args_create = null;	
		}
	}
};

// Check arguments value and find the gameobject if some are referenced
// From the editor, an arg value can have this form : #GO_XX where XX is a Number
// This references the gameobject with the id equal to XX
LR.LevelImporterGame.prototype.processBehaviourArgs = function(_game, _behaviour) {
	for(var key in _behaviour.args_create){
		var value = _behaviour.args_create[key];
		if( typeof value === 'string'){
			if( value.indexOf("#GO_") == 0){
				value = value.substring(4);
				_behaviour.args_create[key] = LR.GameObject.FindByID(_game.world,parseInt(value));
			}
		}
	}
	return _behaviour;
};