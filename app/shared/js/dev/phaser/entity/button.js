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
* @param {number} over frame id
* @param {number} out frame id
* @param {number} down frame id
* @param {number} up frame id
* @param {stirng} name Name of the GameObject attached
*/
LR.Entity.Button = function(_game, _x, _y, _key, _overFrame, _outFrame, _downFrame, _upFrame, _name) {
	Phaser.Button.call(this, _game, _x, _y, _key, this.onClick, this, _overFrame, _outFrame, _downFrame, _upFrame);

	this.anchor.setTo(0.5, 0.5);

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

/**
* call behaviours onClick function
*
* @method onClick
*/
LR.Entity.Button.prototype.onClick = function() {
	if (this.go) {
		for (var i = 0; i < this.go.behaviours.length; i++) {
			var behaviour = this.go.behaviours[i];

			if (typeof behaviour.onClick === "function") {
				behaviour.onClick();
			}
		};
	}
};
