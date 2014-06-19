"use strict";

LR.Loopy.Behaviour.Obstacle = function(_gameobject){	
	LR.Behaviour.call(this,_gameobject);
	//  Enable if for physics. This creates a default rectangular body.
	_gameobject.enablePhysics(PhysicsSettings.STATIC);
};


LR.Loopy.Behaviour.Obstacle.prototype = Object.create(LR.Behaviour.prototype);
LR.Loopy.Behaviour.Obstacle.prototype.constructor = LR.Loopy.Behaviour.Obstacle;
