"use strict";

/**
* Class PlayerSave. Load and Manages the save data for the player
*
* @class PlayerSave
* @constructor
* @param {Phaser.Game} game
* @param {Phaser.Group} parent
*/
Phaser.Plugin.PlayerSave = function( _game, _parent ){
	this.saveData = {};
	this.game = _game;

	if (Phaser.Plugin.PlayerSave.INSTANCE == null) {
		Phaser.Plugin.call(this, _game, _parent);

		Phaser.Plugin.PlayerSave.INSTANCE = this;
		_game.playerSave = Phaser.Plugin.PlayerSave.INSTANCE;
	}

	return Phaser.Plugin.PlayerSave.INSTANCE;
}

Phaser.Plugin.PlayerSave.prototype = Object.create(Phaser.Plugin);
Phaser.Plugin.PlayerSave.prototype.constructor = Phaser.Plugin.PlayerSave;

Phaser.Plugin.PlayerSave.prototype.loadSave = function(_save){
	this.saveData = _save;
	if( _save != null)
		this.tempData = JSON.parse(JSON.stringify(_save));
}

/**
* Write the save. If it's not done before the game is closed, the temporary save will be lost
*
* @method writeSave
*/
Phaser.Plugin.PlayerSave.prototype.writeSave = function(){
	//write Save
	this.saveData = JSON.parse(JSON.stringify(this.tempData));
	this.tempData = JSON.parse(JSON.stringify(this.saveData));
}

/**
* Returns the temporary save for the actual game
*
* @method getSave
*/
Phaser.Plugin.PlayerSave.prototype.getSave = function(){
	return this.tempData;
}

/**
* Returns the save for the current level
*
* @method getLevelSave
* @return {Object}
*/
Phaser.Plugin.PlayerSave.prototype.getLevelSave = function(){
	var levelData = this.tempData[ this.game.state.getCurrentState().levelName ];
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