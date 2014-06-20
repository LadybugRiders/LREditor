"use strict";

var LoadingState = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("Loading", this, false);
};

LoadingState.prototype = Object.create(LR.State.prototype);
LoadingState.prototype.constructor = LoadingState;

LoadingState.prototype.preload = function() {
	this.game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);
}

LoadingState.prototype.create = function() {
	var levelname = GameCore.GetUrlParamValue("levelname");
	var storage = GameCore.GetUrlParamValue("storage");
	if (levelname && storage) {
		this.game.state.start("Level");
	} else {
		//this.game.state.start("Play);
		this.game.state.start("SelectionMenu");
	}
}

LoadingState.prototype.update = function() {
}

LoadingState.prototype.render = function() {
}
