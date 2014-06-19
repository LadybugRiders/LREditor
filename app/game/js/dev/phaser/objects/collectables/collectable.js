"use strict"

/**
* When colliding with the player, this behaviour will send the message "collect" to the GameObject it's attached to
*
* @namespace Behaviour
* @class Collectable
* @constructor
*/
LR.Loopy.Behaviour.Collectable = function(_gameobject){
	LR.Behaviour.call(this,_gameobject);
	_gameobject.enablePhysics(PhysicsSettings.STATIC);
	_gameobject.enableSensor();
	_gameobject.enableEvents();

	this.collected = false;
}

LR.Loopy.Behaviour.Collectable.prototype = Object.create(LR.Behaviour.prototype);
LR.Loopy.Behaviour.Collectable.prototype.constructor = LR.Loopy.Behaviour.Collectable;

LR.Loopy.Behaviour.Collectable.prototype.onBeginContact = function(_otherBody, _myShape, _otherShape, _equation){
	if( this.collected )
		return;
	if( _otherBody.go.layer == "player"){
		//get player script
		var script = _otherBody.go.getBehaviour(LR.Loopy.Behaviour.PlayerRunnerController);
		if( script == null)
			return;
		//check if the colliding shape is the main player shape
		if( script.isMainShape(_otherShape) ){
			this.go.sendMessage("collect");
			this.collected = true;
		}
	}
}
