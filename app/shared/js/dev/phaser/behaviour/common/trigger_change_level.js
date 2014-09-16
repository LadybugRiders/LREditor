"use strict";
//>>LREditor.Behaviour.name: LR.Behaviour.TriggerChangeLevel
//>>LREditor.Behaviour.params : {"levelName":"", "interactives":[]}
//>>LREditor.Behaviour.desc : Change level on contact

/**
* Class TriggerChangeLevel.
* Special Trigger that changes level when entered
*
* @namespace Behaviour
* @class TriggerChangeLevel
* @constructor
* @param {GameObject} gameobject
*/
LR.Behaviour.TriggerChangeLevel = function(_gameobject){
	LR.Behaviour.Trigger.call(this,_gameobject);
	
	this.nextState = "Level";
	this.nextLevel = null;

}

LR.Behaviour.TriggerChangeLevel.prototype = Object.create(LR.Behaviour.Trigger.prototype);
LR.Behaviour.TriggerChangeLevel.prototype.constructor = LR.Behaviour.TriggerChangeLevel;

/**
* Creation data properties 
* levelName - name of the next level to load (if any)
*
* @method create
* @param {data} data Object containing properties to be assigned at the creation of the game
*/
LR.Behaviour.TriggerChangeLevel.prototype.create = function(_data){
	if( _data == null )
		return;
	LR.Behaviour.Trigger.prototype.create.call(this,_data);

	if( _data.levelName && _data.levelName != "" )
		this.nextLevel = _data.levelName;
}

LR.Behaviour.TriggerChangeLevel.prototype.onTriggered = function(_gameobject){
	console.log(this.nextLevel);
	this.entity.game.state.start("Level", true, false, {levelName: this.nextLevel});
}