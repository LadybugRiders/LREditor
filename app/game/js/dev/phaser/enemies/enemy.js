"use strict";

/**
* Enemy Behaviour. Override the hit(_data) method to do your process when the gameobject is hit
*
* @namespace Behaviour
* @class Enemy
* @constructor
* @param {GameObject} gameobject
*/
LR.Loopy.Behaviour.Enemy = function(_gameobject){
	LR.Behaviour.call(this,_gameobject);
	//  Enable if for physics. This creates a default rectangular body.
	_gameobject.enableEvents();

	/**
	* Velocity that the enemy will take when hit
	*
	* @property hitForce
	* @type {Phaser.Point}
	* @default {400,-400}
	*/
	this.hitForce = new Phaser.Point(400,-400);
	/**
	* Rotation force applied when the enemy will take a hit
	*
	* @property hitRotation
	* @type {number}
	* @default 10
	*/
	this.hitRotation = 10;

	this.StateEnum = { IDLE : "idle", HIT : "hit"}
	this.state = this.StateEnum.IDLE;

	this.triggerDeath = this.go.addBehaviour( new LR.Behaviour.Trigger(this.go));
	this.triggerDeath.interactives = ["player"];
	this.triggerDeath.callbackName = "hit";
	this.triggerDeath.messageObject.typeHit = "enemy";
}

LR.Loopy.Behaviour.Enemy.prototype = Object.create(LR.Behaviour.prototype);
LR.Loopy.Behaviour.Enemy.prototype.constructor = LR.Loopy.Behaviour.Enemy;

LR.Loopy.Behaviour.Enemy.prototype.update = function(){

}

LR.Loopy.Behaviour.Enemy.prototype.onBeginContact = function(){
}

/**
* Hit method, called by the hitter. The data in parameter should contain info 
*
* @method hit
* @param {Object} _dataSender Object containing data from the sender
*/
LR.Loopy.Behaviour.Enemy.prototype.hit = function(_dataSender){
	if( this.state == this.StateEnum.HIT )
		return;
	this.state = this.StateEnum.HIT;
	//Add force to simulate hit
	this.entity.body.velocity.x = this.hitForce.x;
	this.entity.body.velocity.y = this.hitForce.y;
	this.entity.body.fixedRotation = false;
	this.entity.body.angularVelocity = this.hitRotation;
	//change layer 
	this.go.changeLayer("player");
}

/**
* Die method. This will trigger the death of the enemy
*
* @method die
* @param {Object} _dataSender Object containing data from the sender
*/
LR.Loopy.Behaviour.Enemy.prototype.die = function(_dataSender){

}