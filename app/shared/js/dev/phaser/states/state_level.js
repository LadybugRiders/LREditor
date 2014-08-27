"use strict";

LR.State.StateLevel = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("Level", this, false);

	this.level = null;

	this.forbidUpdate = true;
};

LR.State.StateLevel.prototype = Object.create(LR.State.prototype);
LR.State.StateLevel.prototype.constructor = LR.State.StateLevel;

LR.State.StateLevel.prototype.init = function(_args) {
	if (_args) {
		if (_args.levelName) {
			this.levelName = _args.levelName;
			this.storage = "file";
		}
	}
};

LR.State.StateLevel.prototype.preload = function() {
	if (this.levelName == null) {
		this.levelName = LR.Game.GetUrlParamValue("levelname");
	}

	if (this.storage == null) {
		this.storage = LR.Game.GetUrlParamValue("storage");
	}

	//LEVEL JSON FILE LOADING
	if (this.storage === "localstorage") {
		// load from localstorage
		var lvlStr = localStorage.getItem(this.levelName);
		this.level = JSON.parse(lvlStr);
	} else {
		var url = "assets/levels/" + this.levelName + ".json";
		// load from file
		this.game.load.json("level", url, true);
	}

};

LR.State.StateLevel.prototype.create = function() {
	var instance = this;

	//====== PHYSICS ============
	//init P2 system
	this.game.physics.startSystem(Phaser.Physics.P2JS);
	//Create the collision manager
	this.collisionManager = new CollisionManager(this.game);
	//Try getting layers data from the loaded file ( at assets/physics/layers.json )
	var layersData = this.game.cache.getJSON("layersData")
	if( layersData )
  		this.collisionManager.init(layersData);
	this.game.physics.p2.gravity.y = 600;

	//init input right away
	this.game.inputManager.init( this.game.cache.getJSON("inputsData"));

	if (this.game.cache.getJSON("level")) {
		this.level = this.game.cache.getJSON("level");
	}
	
	if (this.level) {
		// convert in JSON if needed
		if (typeof this.level === "string") {
			this.level = JSON.parse(this.level);
		}

		var importer = new LR.LevelImporterGame();
		importer.import(this.level, this.game, function(_error, _game) {
			instance.startGameOjects();
			instance.forbidUpdate = false;
		});
	} else {
		console.error("No level");
	}


};

LR.State.StateLevel.prototype.startGameOjects = function() {
	for (var i = 0; i < this.gameobjects.length; i++) {
		var go = this.gameobjects[i];
		go.start();
	};
};
