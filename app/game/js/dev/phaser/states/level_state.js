"use strict";

LR.Loopy.State.LevelState = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("Level", this, false);

	this.level = null;
};

LR.Loopy.State.LevelState.prototype = Object.create(LR.State.prototype);
LR.Loopy.State.LevelState.prototype.constructor = LR.Loopy.State.LevelState;

LR.Loopy.State.LevelState.prototype.init = function(_args) {
	if (_args) {
		if (_args.levelName) {
			this.levelName = _args.levelName;
			this.storage = "file";
		}
	}
};

LR.Loopy.State.LevelState.prototype.preload = function() {
	if (this.levelName == null) {
		this.levelName = GameCore.GetUrlParamValue("levelname");
	}

	if (this.storage == null) {
		this.storage = GameCore.GetUrlParamValue("storage");
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

LR.Loopy.State.LevelState.prototype.create = function() {
	//this has to be done since 2.0.3 is not working well with inputs
	this.game.inputManager.init(InputSettings.keys);
	//physics
	this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.collisionManager = new CollisionManager(this.game);
    this.collisionManager.init(PhysicsSettings.LAYERS);
	this.game.physics.p2.gravity.y = PhysicsSettings.GLOBAL_GRAVITY;
	
	if (this.game.cache.getJSON("level")) {
		this.level = this.game.cache.getJSON("level");
	}
	
	if (this.level) {
		// convert in JSON if needed
		if (typeof this.level === "string") {
			this.level = JSON.parse(this.level);
		}

		var importer = new LR.LevelImporterGame();
		importer.import(this.level, this.game);

		
	} else {
		console.error("LevelState - No level");
	}

};