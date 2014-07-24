"use strict";
//>>LREditor.Behaviour.name: LR.Behaviour.TriggerChangeState
//>>LREditor.Behaviour.params : {"levelName":"", "interactives":[]}

/**
* Class TriggerChangeState.
* Special Trigger that changes level when entered
*
* @namespace Behaviour
* @class TriggerChangeState
* @constructor
* @param {GameObject} gameobject
*/
LR.Behaviour.TriggerChangeState = function(_gameobject){
	LR.Behaviour.Trigger.call(this,_gameobject);
	
	this.nextState = "Level";
	this.nextLevel = null;

}

LR.Behaviour.TriggerChangeState.prototype = Object.create(LR.Behaviour.Trigger.prototype);
LR.Behaviour.TriggerChangeState.prototype.constructor = LR.Behaviour.TriggerChangeState;

/**
* Creation data properties 
* stateName - name of the next state to load
* levelName - name of the next level to load (if any)
*
* @method create
* @param {data} data Object containing properties to be assigned at the creation of the game
*/
LR.Behaviour.TriggerChangeState.prototype.create = function(_data){
	if( _data == null )
		return;
	LR.Behaviour.Trigger.prototype.create.call(this,_data);

	if( _data.levelName && _data.levelName != "" )
		this.nextLevel = _data.levelName;
	if( _data.stateName && _data.stateName != "" )
		this.nextState = _data.stateName;
}

LR.Behaviour.TriggerChangeState.prototype.onTriggered = function(_gameobject){
	console.log(this.nextLevel);
	this.entity.game.state.start("Level", true, false, {levelName: this.nextLevel});
}