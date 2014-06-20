"use strict";

var BootState = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("Boot", this, false);
};

BootState.prototype = Object.create(LR.State.prototype);
BootState.prototype.constructor = BootState;

BootState.prototype.preload = function() {
}

BootState.prototype.create = function() {
	this.game.plugins.add(Phaser.Plugin.Pollinator);
	this.game.state.start("Loading");	
}

BootState.prototype.update = function() {
}

BootState.prototype.render = function() {
}
