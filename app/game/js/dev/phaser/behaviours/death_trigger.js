"use strict";

var DeathTrigger = function(_gameobject) {
	LR.Behaviour.call(this, _gameobject);

};

DeathTrigger.prototype = Object.create(LR.Behaviour.prototype);
DeathTrigger.prototype.constructor = DeathTrigger;

DeathTrigger.prototype.onBeginContact = function(_otherBody, _myShape, _otherShape, _equation){
	// clear forces
	_otherBody.setZeroVelocity();
	_otherBody.setZeroRotation();

	// reset position and angle
	_otherBody.x = 0;
	_otherBody.y = 0;
	_otherBody.angle = 0;
}