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