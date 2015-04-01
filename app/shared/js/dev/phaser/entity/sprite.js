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

	/**
	* Tells if the sprite is actually hidden. Set outOfViewHide to true to enable this option.
	*
	* @property hidden
	* @type boolean
	* @default false
	*/
	this.hidden = false;
	/**
	* Enable sprite to be hidden when out of the camera view.
	* Each time a sprite is hidden/shown, the callback onHide/onShow are called onto GameObject
	* Create this methods in the behaviours on the object to get this events ( ie : Behaviour.prototype.onHide = function(){})
	*
	* @property outOfViewHide
	* @type boolean
	* @default false
	*/
	this.outOfViewHide = false;
	/**
	* If the sprite is hidden, this is the alpha that will be set when it comes back on the screen
	* You may want to change this variable instead of alpha if the sprite is hidden at that moment
	* To avoid any issue, just set outOfViewHide to false
	*
	* @property alphaBeforeHide
	* @type Number
	*/
	this.alphaBeforeHide = 1;

	this.events.onAddedToGroup.add(this.onAddedToGroup,this);

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
			this.go.sendMessage("onShow");
			this.alpha = this.alphaBeforeHide;
		}
		//hide if quits camera view
		if( !inCam && !this.hidden ){
			this.hidden = true;
			this.go.sendMessage("onHide");
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

// Called by the parent group when the scene is launching. All objects are created then.
LR.Entity.Sprite.prototype.onAddedToGroup = function(_sprite,_group) {	
	if(this.body && this.body.onSpriteAddedToGroup){
		this.body.onSpriteAddedToGroup(_sprite,_group);
	}
};
