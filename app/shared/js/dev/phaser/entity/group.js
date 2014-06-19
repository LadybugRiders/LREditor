"use strict";

LR.Entity.Group = function(_game) {
	Phaser.Group.call(this, _game);

	this.go = new LR.GameObject(this);
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