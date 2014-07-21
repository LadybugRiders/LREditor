"use strict";

LR.State.StateLoader = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("Loader", this, false);
};

LR.State.StateLoader.prototype = Object.create(LR.State.prototype);
LR.State.StateLoader.prototype.constructor = LR.State.StateLoader;

LR.State.StateLoader.prototype.preload = function() {
	this.game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);
}

LR.State.StateLoader.prototype.create = function() {
	var levelname = GameCore.GetUrlParamValue("levelname");
	var storage = GameCore.GetUrlParamValue("storage");
	if (levelname && storage) {
		this.game.state.start("Level");
	} else {
		// get the first level specified in project settings
		console.log("TODO : get the first level specified in project settings");
	}
}

LR.State.StateLoader.prototype.update = function() {
}

LR.State.StateLoader.prototype.render = function() {
}
