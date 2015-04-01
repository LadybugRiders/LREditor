"use strict";

LR.Entity.Group = function(_game) {
	Phaser.Group.call(this, _game);

	this.go = new LR.GameObject(this);

	this.world = new Phaser.Point();
	this.worldAngle = 0;

};

LR.Entity.Group.prototype = Object.create(Phaser.Group.prototype);
LR.Entity.Group.prototype.constructor = LR.Entity.Group;

// Called when the scene is launching. All objects are created then.
LR.Entity.Group.prototype.start = function() {
	if (this.go) {
		this.go.start();
	}
};

LR.Entity.Group.prototype.update = function() {
	Phaser.Group.prototype.update.call(this);
	if (this.go) {
		if (this.exists) {
			this.go.update();
		}
	}
};

LR.Entity.Group.prototype.postUpdate = function() {
	Phaser.Group.prototype.postUpdate.call(this);
	
	//Set world position of the group
	this.world.setTo(this.game.camera.x + this.worldTransform.tx, 
					this.game.camera.y + this.worldTransform.ty);
	//Compute world angle in degrees
	this.worldAngle = Math.acos(this.worldTransform.a)*180/Math.PI
					 * (this.worldTransform.b >= 0 ? 1 : -1);

	if (this.go) {
		if (this.exists) {
			this.go.postUpdate();
		}
	}
};

LR.Entity.Group.prototype.render = function() {
	Phaser.Group.prototype.render.call(this);
	if (this.go) {
		this.go.render();
	}
};

LR.Entity.Group.prototype.destroy = function() {
	if (this.go) {
		this.go.destroy();
	}
	Phaser.Group.prototype.destroy.call(this);
};

LR.Entity.Group.prototype.onAddedToGroup = function(_addedGroup,_parentGroup) {
	if( _parentGroup.world ){
		this.world.x = this.x + _parentGroup.world.x;
		this.world.y = this.y + _parentGroup.world.y;
	}else{
		this.world.x = this.x;
		this.world.y = this.y;
	}
	for(var i=0; i < this.children.length; i++){
		if( this.children[i].onAddedToGroup != null)
			this.children[i].onAddedToGroup(this.children[i],this);
	}
};