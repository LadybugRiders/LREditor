"use strict";

/**
* TileSprite class
*
* @namespace Entity
* @class TileSprite
* @constructor
* @param {Phaser.Game} game
* @param {number} x
* @param {number} y
* @param {width} x
* @param {height} y
* @param {string} texture Key of the texture to be used
* @param {stirng} name Name of the GameObject attached
*/
LR.Entity.TileSprite = function(_game, _x, _y, _width, _height, _texture,_name) {

	if( _width == null ) _width = 32;
	if( _height == null ) _height = 32;

	Phaser.TileSprite.call(this, _game, _x, _y, _width,_height, _texture);

	this.anchor.setTo(0.5, 0.5);

	this.go = new LR.GameObject(this);
	if( _name ){
		this.go.name = _name;
	}else{
		this.go.name = _texture;
	}

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
	
	this.alphaBeforeHide = 1;

	this.events.onAddedToGroup.add(this.onAddedToGroup,this);
};

LR.Entity.TileSprite.prototype = Object.create(Phaser.TileSprite.prototype);
LR.Entity.TileSprite.prototype.constructor = LR.Entity.TileSprite;


// Called when the scene is launching. All objects are created then.
LR.Entity.TileSprite.prototype.start = function() {
	if (this.go) {
		this.go.start();
	}
};

LR.Entity.TileSprite.prototype.update = function() {
	Phaser.TileSprite.prototype.update.call(this);
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

LR.Entity.TileSprite.prototype.postUpdate = function() {
	Phaser.TileSprite.prototype.postUpdate.call(this);
	if (this.go) {
		if (this.exists) {
			this.go.postUpdate();
		}
	}
};

LR.Entity.TileSprite.prototype.render = function() {
	Phaser.TileSprite.prototype.render.call(this);
	if (this.go) {
		this.go.render();
	}
};

LR.Entity.TileSprite.prototype.destroy = function() {
	if (this.go) {
		this.go.destroy();
	}
	Phaser.TileSprite.prototype.destroy.call(this);
};

// Called when the scene is launching. All objects are created then.
LR.Entity.TileSprite.prototype.onAddedToGroup = function(_sprite,_group) {
	if(this.body && this.body.onSpriteAddedToGroup){
		this.body.onSpriteAddedToGroup(_sprite,_group);
	}
};
