"use strict";

/**
* The weapon doesn't need to be visible. It's basically a bounding box that will be activated when the owner attacks.
* 
* @class Weapon
*/
LR.Loopy.Behaviour.Weapon = function(_gameobject){
	LR.Behaviour.call(this,_gameobject);

	//offset of the wepon from the owner body center point of view
	this.offsetX = 25;
	this.offsetY = 0;

	this.direction = 1;

	/**
	* @property attacking
	* @type {boolean}
	*/
	this.attacking = false;

	/**
	* Owner of the weapon ( different from gameobject to which to script's attached )
	*@type {GameObject}
	*/
	this.owner = null;

	/**
	* How long the attack will last, in seconds
	* @property {number} seconds
	*/
	this.timeAttack = 0.4;

	this.entity.kill();
}

LR.Loopy.Behaviour.Weapon.prototype = Object.create(LR.Behaviour.prototype);
LR.Loopy.Behaviour.Weapon.prototype.constructor = LR.Loopy.Behaviour.Weapon;

/**
* Data :
* {String} owner - name of the entity owning the weapon 
*
* @method create
* @param {Object} data
*/
LR.Loopy.Behaviour.Weapon.prototype.create = function(_data){
	this.go.enableEvents();
	if( _data.owner)
		this.owner = this.entity.game.state.getCurrentState().findGameObjectByName(_data.owner);
}

LR.Loopy.Behaviour.Weapon.prototype.update = function(){
	this.place();
}

/**
* Sets the owner object of the weapong. You can say the wielder.
* 
* @method setOwner
* @param {GameObject} owner The owner of the weapon. When the weapon attacks, it follows its owner. A GameObject is recommended here, although it could work
* with any object having x and y properties
*/
LR.Loopy.Behaviour.Weapon.prototype.setOwner = function(_owner){
	this.owner = _owner;
}

/**
* Attacks in the given direction 
* @method attack
* @param direction
*/
LR.Loopy.Behaviour.Weapon.prototype.attack = function(_direction){
	this.go.body.debug = true;
	this.attacking = true;
	this.entity.revive();
	this.direction = _direction;
	if( this.owner != null ){
		this.place();
		this.go.game.time.events.add(Phaser.Timer.SECOND * this.timeAttack, this.endAttack, this);
	}else{
		console.log(" Weapon " + this + " has no owner");
	}
}

LR.Loopy.Behaviour.Weapon.prototype.endAttack = function(){
	this.entity.kill();
	this.owner.sendMessage("endAttack", {sender : this});
	this.attacking = false;
}

//Process the shape origin of the signal and call specific methods
LR.Loopy.Behaviour.Weapon.prototype.onBeginContact = function(_otherBody, _myShape, _otherShape, _equation){
	if( this.attacking ){		
		var data = { "sender" : this, "senderShape" : _myShape };
		_otherBody.go.sendMessage("hit", data);
	}
}

LR.Loopy.Behaviour.Weapon.prototype.place = function(){
	if( this.owner != null ){
		this.go.body.x = this.owner.body.x + this.offsetX;
		this.go.body.y = this.owner.body.y + this.offsetY;
	}
}