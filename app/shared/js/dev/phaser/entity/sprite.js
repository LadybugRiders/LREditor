"use strict";

/**
* Sprite class
*
* @namespace Entity
* @class Sprite
* @constructor
* @param {Phaser.Game} game
* @param {number} x
* @param {number} y
* @param {string} texture Key of the texture to be used
* @param {stirng} name Name of the GameObject attached
*/
LR.Entity.Sprite = function(_game, _x, _y, _texture, _name) {
	Phaser.Sprite.call(this, _game, _x, _y, _texture);

	this.anchor.setTo(0.5, 0.5);

	this.go = new LR.GameObject(this);
	if( _name ){
		this.go.name = _name;
	}else{
		this.go.name = _texture;
	}
	this.localPosition = new Phaser.Point();

	this.events.onAddedToGroup.add(this.onAddedToGroup,this);

	this.hidden = false;
	this.outOfViewHide = false;
	this.alphaBeforeHide = 1;

};

LR.Entity.Sprite.prototype = Object.create(Phaser.Sprite.prototype);
LR.Entity.Sprite.prototype.constructor = LR.Entity.Sprite;

// Called when the scene is launching. All objects are created then.
LR.Entity.Sprite.prototype.start = function() {
	if (this.go) {
		this.go.start();
	}
};

LR.Entity.Sprite.prototype.update = function() {
	Phaser.Sprite.prototype.update.call(this);
	if (this.go) {
		if (this.exists) {
			this.go.update();
		}
	}

	if( this.outOfViewHide ){
		
		var inCam = LR.Utils.isSpriteInCameraView(this,this.game.camera);
		
		//show if enters camera view
		if( inCam && this.hidden ){
			this.hidden = false;
			this.alpha = this.alphaBeforeHide;
		}
		//hide if quits camera view
		if( !inCam && !this.hidden ){
			this.hidden = true;
			this.alphaBeforeHide = this.alpha;
			this.alpha = 0;
		}
	}
};

LR.Entity.Sprite.prototype.postUpdate = function() {

	Phaser.Sprite.prototype.postUpdate.call(this);

	if (this.go) {
		if (this.exists) {
			this.go.postUpdate();
		}
	}
};

LR.Entity.Sprite.prototype.render = function() {
	Phaser.Sprite.prototype.render.call(this);
	if (this.go) {
		this.go.render();
	}
};

LR.Entity.Sprite.prototype.destroy = function() {
	if (this.go) {
		this.go.destroy();
	}
	Phaser.Sprite.prototype.destroy.call(this);
};

// Called when the scene is launching. All objects are created then.
LR.Entity.Sprite.prototype.onAddedToGroup = function(_sprite,_group) {
	if(this.body && this.body.onSpriteAddedToGroup){
		this.body.onSpriteAddedToGroup(_sprite,_group);
	}
};