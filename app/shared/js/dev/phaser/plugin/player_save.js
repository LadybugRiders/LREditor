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
	this.activeLevelName = null;
	this.game = _game;
	this.storageSave = null;

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
* @method getValue
*/
Phaser.Plugin.PlayerSave.prototype.getValue = function(_key){	
  	return this.tempData[_key];
}

/**
* Write the single data into localStorage. The value written will be the temporary one.
* Be aware that arrays and objects are not supported by local storage. You need to stringify them
* @param key Name of the variable
* @method writeValue
*/
Phaser.Plugin.PlayerSave.prototype.writeValue = function(_key){	
  	if( this.tempData[_key] ){
  		this.saveData[_key] = this.tempData[_key];
  		localStorage.setItem("game_save",JSON.stringify(this.saveData));
  	}
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
* Use getPersistentSave to access persistent data 
* @method getSave
*/
Phaser.Plugin.PlayerSave.prototype.getSave = function(){
	return this.tempData;
}

/**
* Returns the current persistent save. This data is unchanged until you apply (write) the temporary save
* @method getPermanentSave
*/
Phaser.Plugin.PlayerSave.prototype.getPermanentSave = function(){
	return this.saveData;
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
		_levelName = this.game.state.getCurrentState().levelName;
	var levelData = this.tempData.levels[ _levelName ];
	return levelData;
}

/**
* Returns the save previously activated for the specified level
*
* @method getActiveLevelSave
* @return {Object}
*/
Phaser.Plugin.PlayerSave.prototype.getActiveLevelSave = function(){
	return this.getLevelSave(this.activeLevelName);
}

/**
* Activate a level save. By doing this, you may get the current active level save using getActiveLevelSave.
* This doesn't affect the save whatsoever, it's just a tools for a quick access 
*( if you have a level with many sublevels for example, you can gather all the data in only one level save)
*
* @method activateLevelSave
* @param levelName Name of the level in the save 
* @return {Object}
*/
Phaser.Plugin.PlayerSave.prototype.activateLevelSave = function(_levelName){
	this.activeLevelName = _levelName;
}

/**
* Revert the save for the current level
*
* @method revertLevelSave
*/
Phaser.Plugin.PlayerSave.prototype.revertLevelSave = function(){
	var levelName =  this.game.state.getCurrentState().levelName;
	this.tempData.levels[this.activeLevelName] = JSON.parse(JSON.stringify(this.saveData.levels[this.activeLevelName]));
}

/**
* Delete save. This deletes even the stored save of the game.
*
* @method deleteSave
*/
Phaser.Plugin.PlayerSave.prototype.deleteSave = function(){
	this.saveData = {levels:{}};
	this.tempData = {levels:{}};
	localStorage.setItem("game_save",JSON.stringify(this.saveData));
}

function createSave(_this){	
  	var storedSave = localStorage.getItem("game_save");

  	if( storedSave == null){
  		localStorage.setItem("game_save",JSON.stringify(_this.saveData));
  	}
  	//storageSave contains save data as a string
  	_this.storageSave = storedSave;
  	_this.saveData = JSON.parse(storedSave);
  	_this.tempData = JSON.parse(storedSave);;
}