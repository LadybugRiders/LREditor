"use strict";

LR.Game = function(_containerId,_scaleMode,_debug) {
	/*
	* The Input Manager of LadybugRiders Engine
	* 
	* @property inputManager
	* @type {Phaser.Plugin.InputManager}
	*/
	this.inputManager = null;

	var preload = function() {
		// load layers from json file
		this.game.load.json("layersData", "assets/physics/layers.json", true);
		// load inputs from json file
		this.game.load.json("inputsData", "assets/inputs/inputs.json", true);
		//load save
		this.game.load.json("saveData","assets/save/playersave.json",true);
	};

	var create = function() {
		if(_debug)
			this.game.add.plugin(Phaser.Plugin.Debug);
		this.game.plugins.add(Phaser.Plugin.PlayerSave);
		this.game.plugins.add(Phaser.Plugin.InputManager);
		this.game.plugins.add(Phaser.Plugin.CutsceneManager);
		this.game.plugins.add(Phaser.Plugin.DialogManager);

		this.game.playerSave.loadSave(this.game.cache.getJSON("saveData"));

		//Scale
		if(this.scaleMode != null){
			this.game.scale.scaleMode = this.scaleMode;
			this.game.scale.setMaximum();
			this.game.scale.refresh();
		}

		var stateBoot = new LR.State.StateBoot(this);
		var stateLoader = new LR.State.StateLoader(this);
		var stateLevel = new LR.State.StateLevel(this);

		//COCOON JS needs JSON parser		
		if( this.game.device.cocoonJS == true){
			 window.DOMParser = DOMishParser;
		}

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
		render: render,
		scaleMode : _scaleMode
	};

	var renderType = Phaser.AUTO;

	var appVersion = window.navigator.appVersion.toLowerCase();
	if( appVersion.indexOf("android") >= 0 || appVersion.indexOf("ios") >= 0)
		renderType = Phaser.CANVAS;

	Phaser.Game.call(this, 640, 360,
					 renderType, _containerId, functions);
}

LR.Game.prototype = Object.create(Phaser.Game.prototype);
LR.Game.prototype.constructor = LR.Game;

LR.Game.GetUrlParamValue = function(_param) {
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

