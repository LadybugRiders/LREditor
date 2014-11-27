"use strict";

/**
* Class PlayerSave. Load and Manages the save data for the player.
*
* @class PlayerSave
* @namespace Phaser.Plugin
* @constructor
* @param {Phaser.Game} game
* @param {Phaser.Group} parent
*/
Phaser.Plugin.PlayerSave = function( _game, _parent ){
	this.saveData = {levels:{}};
	this.game = _game;

	createSave(this);

	if (Phaser.Plugin.PlayerSave.INSTANCE == null) {
		Phaser.Plugin.call(this, _game, _parent);

		Phaser.Plugin.PlayerSave.INSTANCE = this;
		_game.playerSave = Phaser.Plugin.PlayerSave.INSTANCE;
	}

	return Phaser.Plugin.PlayerSave.INSTANCE;
}

Phaser.Plugin.PlayerSave.prototype = Object.create(Phaser.Plugin);
Phaser.Plugin.PlayerSave.prototype.constructor = Phaser.Plugin.PlayerSave;

/**
* Sets the value in the save
*
* @param key Name of the variable
* @param value The value to store
* @method setValue
*/
Phaser.Plugin.PlayerSave.prototype.setValue = function(_key,_value){	
  	this.tempData[_key] = _value;
}

/**
* Gets the value in the save
*
* @param key Name of the variable
* @method setValue
*/
Phaser.Plugin.PlayerSave.prototype.getValue = function(_key){	
  	return this.tempData[_key];
}

/**
* Write the save.
*
* @method writeSave
*/
Phaser.Plugin.PlayerSave.prototype.writeSave = function(){
	//write Save
	this.saveData = JSON.parse(JSON.stringify(this.tempData));
	this.tempData = JSON.parse(JSON.stringify(this.saveData));
  	localStorage.setItem("game_save",JSON.stringify(this.saveData));
}

/**
* Returns the current save for the actual game.
* This actually returns the temporary save. Use writeSave to apply changes to the overall game save
*
* @method getSave
*/
Phaser.Plugin.PlayerSave.prototype.getSave = function(){
	return this.tempData;
}

/**
* Creates a new save for the given level
*
* @method createLevelSave
* @return {Object} the level save
*/
Phaser.Plugin.PlayerSave.prototype.createLevelSave = function(_levelName){
	this.tempData.levels[ _levelName ] = {};
	return this.tempData.levels[ _levelName ];
}

/**
* Returns the save for the specified level
* If none provided, returns the save for the current one
*
* @method getLevelSave
* @param levelName Name of the level save 
* @return {Object}
*/
Phaser.Plugin.PlayerSave.prototype.getLevelSave = function(_levelName){
	if(_levelName == null)
		_levelName = this.game.state.getCurrentState().levelName
	var levelData = this.tempData.levels[ _levelName ];
	return levelData;
}

/**
* Revert the save for the current level
*
* @method revertLevelSave
*/
Phaser.Plugin.PlayerSave.prototype.revertLevelSave = function(){
	var levelName =  this.game.state.getCurrentState().levelName;
	this.tempData[levelName] = JSON.parse(JSON.stringify(this.saveData[levelName]));
}

function createSave(_this){	
  	var storedSave = localStorage.getItem("game_save");
  	console.log(storedSave);
  	if( storedSave == null){
  		localStorage.setItem("game_save",JSON.stringify(_this.saveData));
  	}
  	_this.loadSave = JSON.parse(storedSave);
  	_this.tempData = JSON.parse(storedSave);
}