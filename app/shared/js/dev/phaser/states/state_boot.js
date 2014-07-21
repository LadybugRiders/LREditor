"use strict";

LR.State.StateBoot = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("Boot", this, false);
};

LR.State.StateBoot.prototype = Object.create(LR.State.prototype);
LR.State.StateBoot.prototype.constructor = LR.State.StateBoot;

LR.State.StateBoot.prototype.preload = function() {
}

LR.State.StateBoot.prototype.create = function() {
	this.game.plugins.add(Phaser.Plugin.Pollinator);
	this.game.state.start("Loader");	
}

LR.State.StateBoot.prototype.update = function() {
}

LR.State.StateBoot.prototype.render = function() {
}
