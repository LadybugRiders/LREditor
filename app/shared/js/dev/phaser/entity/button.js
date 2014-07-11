"use strict";

/**
* Button class
*
* @namespace Entity
* @class Button
* @constructor
* @param {Phaser.Game} game
* @param {number} x
* @param {number} y
* @param {string} texture Key of the texture to be used
* @param {stirng} name Name of the GameObject attached
*/
LR.Entity.Button = function(_game, _x, _y, _key, _label, _font, _fontSize, _callback, _callbackContext, _overFrame, _outFrame, _downFrame, _upFrame, _name) {
	Phaser.Button.call(this, _game, _x, _y, _key, _callback, _callbackContext, _overFrame, _outFrame, _downFrame, _upFrame);

	this.anchor.setTo(0.5, 0.5);

	this.label = this.game.add.bitmapText(0, 0, _font, _label, _fontSize);
  this.addChild(this.label);
  this.label.align = 'center';
  this.setLabel(_label);

	this.go = new LR.GameObject(this);
	if (_name) {
		this.go.name = _name;
	} else {
		this.go.name = _key;
	}
};

LR.Entity.Button.prototype = Object.create(Phaser.Button.prototype);
LR.Entity.Button.prototype.constructor = LR.Entity.Button;

// Called when the scene is launching. All objects are created then.
LR.Entity.Button.prototype.start = function() {
	if (this.go) {
		this.go.start();
	}
};

LR.Entity.Button.prototype.update = function() {
	Phaser.Button.prototype.update.call(this);
	if (this.go) {
		if (this.exists) {
			this.go.update();
		}
	}
};

LR.Entity.Button.prototype.postUpdate = function() {
	Phaser.Button.prototype.postUpdate.call(this);
	if (this.go) {
		if (this.exists) {
			this.go.postUpdate();
		}
	}
};

LR.Entity.Button.prototype.render = function() {
	Phaser.Button.prototype.render.call(this);
	if (this.go) {
		this.go.render();
	}
};

LR.Entity.Button.prototype.destroy = function() {
	if (this.go) {
		this.go.destroy();
	}
	Phaser.Button.prototype.destroy.call(this);
};

LR.Entity.Button.prototype.setLabel = function(_label) {
    this.label.text = _label;
    var height = this.label.fontSize;
    var width = (height * 0.5) * this.label.text.length;
    this.label.x = Math.floor(this.width * (0.5 - this.anchor.x) - width * 0.5);
    this.label.y = Math.floor(this.height * (0.5 - this.anchor.y) - height * 0.5);
    this.label.x = -width;
};