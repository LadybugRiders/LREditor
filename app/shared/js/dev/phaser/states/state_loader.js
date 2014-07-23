"use strict";

LR.State.StateLoader = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("Loader", this, false);
};

LR.State.StateLoader.prototype = Object.create(LR.State.prototype);
LR.State.StateLoader.prototype.constructor = LR.State.StateLoader;

LR.State.StateLoader.prototype.preload = function() {
	this.game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);

	this.game.load.json("__project", "project.json", true);
}

LR.State.StateLoader.prototype.create = function() {
	var levelname = LR.Game.GetUrlParamValue("levelname");
	var storage = LR.Game.GetUrlParamValue("storage");
	if (levelname && storage) {
		this.game.state.start("Level");
	} else {
		var project = this.game.cache.getJSON("__project");

		if (project) {
			levelname = project.firstLevel;
			if (levelname) {
				this.game.state.start("Level", true, false, {levelName: levelname});
			} else {
				console.warn("LREditor - No level specified (maybe check 'firstLevel' in your 'project.json' file)")
			}
		}
	}
}

LR.State.StateLoader.prototype.update = function() {
}

LR.State.StateLoader.prototype.render = function() {
}
