"use strict";
/**
* Class for State
*
* @namespace LR
* @class class_name
* @constructor
* @param {param_type} param_description
*/
LR.State = function(_game) {
	Phaser.State.call(this, _game);
	/**
	* Array of GameObjects added to this state
	*
	* @property gameobjects
	* @type {Array}
	* @default Array
	*/
	this.gameobjects = new Array();
};

LR.State.prototype = Object.create(Phaser.State.prototype);
LR.State.prototype.constructor = LR.State;

/**
* Adds a GameObject to this state
*
* @method addGameObject
* @param {LR.GameObject} gameobject The GameObject to add
* @param {boolean} addToGame If this method should add the entity of the GameObject to the game
* @param {boolean} enableEvents Enable events from CollisionManager
*/
LR.State.prototype.addGameObject = function(_gameobject,_addToGame, _enableEvents){
	//console.log(_gameobject.name);
	this.gameobjects.push(_gameobject);
	//Add to the current game
	if( _addToGame == true ){
		this.game.add.existing(_gameobject.entity);
	}
	//Add to the collisionManager
	if( _gameobject.body != null && this.collisionManager != null ){
		//console.log(_gameobject.body);
		this.collisionManager.addGameObject(_gameobject,_enableEvents);
	}
}

/**
* Adds a GameObject to this state, to the game and to the CollisionManager
*
* @method addGameObjectFull
* @param {LR.GameObject} gameobject The GameObject to add
*/
LR.State.prototype.addGameObjectFull = function(_gameobject){
	this.addGameObject(_gameobject,true,true);
}

/**
* Return the GameObject of the current state with the name specified 
*
* @method findGameObjectByName
* @param {string} name Name of the wanted GameObject
*/
LR.State.prototype.findGameObjectByName = function(_name){
	var gameobject = null;
	var i = 0;
	while( i < this.gameobjects.length && gameobject == null){
		if( this.gameobjects[i].name == _name )
			gameobject = this.gameobjects[i];
		i++;
	}
	return gameobject;
}

LR.State.prototype.shutdown = function(){
	if( this.collisionManager != null ){
		this.collisionManager.clear();
	}

	for(var i=0; i < this.gameobjects.length ; i++){
		this.gameobjects[i].destroy();
	}
	this.gameobjects = new Array();

	if(this.game.inputManager)
		this.game.inputManager.clearAll();
}

//================================================
//				CUTSCENE
//================================================

LR.State.prototype.onBeginCutscene = function(){
	for(var i=0; i < this.gameobjects.length ; i++){
		this.gameobjects[i].onBeginCutscene();
	}
}

LR.State.prototype.onEndCutscene = function(){
	for(var i=0; i < this.gameobjects.length ; i++){
		this.gameobjects[i].onEndCutscene();
	}
}
