"use strict";

/**
* Class TriggerCutscene.
* Special Trigger that executes a cutscene when colliding with the specified objects
*
* @namespace Behaviour
* @class TriggerCutscene
* @constructor
* @param {GameObject} gameobject
*/
LR.Behaviour.TriggerCutscene = function(_gameobject){
	LR.Behaviour.Trigger.call(this,_gameobject);
	
	_gameobject.enableEvents();

	/**
	* Cuscene name
	*
	* @property cutscene
	* @type string
	* @default null
	*/
	this.cutscene = null;

}

LR.Behaviour.TriggerCutscene.prototype = Object.create(LR.Behaviour.Trigger.prototype);
LR.Behaviour.TriggerCutscene.prototype.constructor = LR.Behaviour.TriggerCutscene;

LR.Behaviour.TriggerCutscene.prototype.create = function(_data){
	if( _data == null )
		return;
	LR.Behaviour.Trigger.prototype.create.call(this,_data);
	if( _data.cutscene )
		this.cutscene = _data.cutscene;
}

LR.Behaviour.TriggerCutscene.prototype.onTriggered = function(_gameobject){
	if( this.entity.game.cutsceneManager ){
		this.entity.game.cutsceneManager.start(this.cutscene);
	}
}