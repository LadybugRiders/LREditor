"use strict";
//>>LREditor.Behaviour.name: LR.Behaviour.TriggerCutScene
//>>LREditor.Behaviour.params : {"cutscene":"", "messageObject" : {}, "interactives":[], "activeCountLimit": 0}
//>>LREditor.Behaviour.desc : Triggers a cutscene on contact

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

/**
* Creation data properties 
* cutscene - name of the cutscene that has to be triggered
*
* @method create
* @param {data} data Object containing properties to be assigned at the creation of the game
*/
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