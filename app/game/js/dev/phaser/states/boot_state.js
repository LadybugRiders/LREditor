"use strict";

LR.Loopy.State.BootState = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("Boot", this, false);
};

LR.Loopy.State.BootState.prototype = Object.create(LR.State.prototype);
LR.Loopy.State.BootState.prototype.constructor = LR.Loopy.State.BootState;

LR.Loopy.State.BootState.prototype.preload = function() {
	// Boot
	this.game.load.spritesheet('loading', 'assets/images/menus/main/loading.png', 128, 128);
}

LR.Loopy.State.BootState.prototype.create = function() {
	this.game.plugins.add(Phaser.Plugin.Pollinator);
	this.game.state.start("Loading");	
}

LR.Loopy.State.BootState.prototype.update = function() {
}

LR.Loopy.State.BootState.prototype.render = function() {
}
