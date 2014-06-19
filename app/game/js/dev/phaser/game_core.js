"use strict";

var GameCore = function() {

	var preload = function() {
	};

	var create = function() {

		this.game.plugins.add(Phaser.Plugin.InputManager);
		this.game.plugins.add(Phaser.Plugin.CutsceneManager);
		this.game.plugins.add(Phaser.Plugin.DialogManager);

		var bootstate = new LR.Loopy.State.BootState(this);
		var loadstate = new LR.Loopy.State.LoadingState(this);
		var selectstate = new LR.Loopy.State.SelectionMenuState(this);
		var playstate = new LR.Loopy.State.PlayState(this);
		var levelstate = new LR.Loopy.State.LevelState(this);

		this.state.start("Boot");
	};

	var update = function() {
	};

	var render = function() {

	};

	var functions = {
		preload: preload,
		create: create,
		update: update,
		render: render
	};

	Phaser.Game.call(this, 640, 360, Phaser.AUTO, 'phaser', functions);
}

GameCore.prototype = Object.create(Phaser.Game.prototype);
GameCore.prototype.constructor = GameCore;

GameCore.GetUrlParamValue = function(_param) {
	var value = null;

	var href = window.location.href.split("?");
	if (href.length > 1) {
		var search = href[1];
		var params = search.split("?");
		if (params.length > 0) {
			params = params[0].split("&");

			var found = false;
			var i = 0;
			while (i < params.length && found == false) {
				var pair = params[i].split("=");
				if (pair[0] == _param) {
					value = pair[1];
					found = true;
				}

				i++;
			}
		}
	}

	return value;
}
