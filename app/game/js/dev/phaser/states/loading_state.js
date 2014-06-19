"use strict";

LR.Loopy.State.LoadingState = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("Loading", this, false);
};

LR.Loopy.State.LoadingState.prototype = Object.create(LR.State.prototype);
LR.Loopy.State.LoadingState.prototype.constructor = LR.Loopy.State.LoadingState;

LR.Loopy.State.LoadingState.prototype.preload = function() {
	this.game.world.setBounds(0, 0, window.innerWidth, window.innerHeight);

	this.loading = this.game.add.sprite(0, 0, 'loading');
	this.loading.anchor.setTo(0.5, 0.5);
	this.loading.x = window.innerWidth * 0.5;
	this.loading.y = window.innerHeight * 0.5;
	this.loading.animations.add("load", [0, 1, 2, 3, 4, 5, 6], 10, true);
	this.loading.animations.play("load", 10, true);

	this.game.load.image("loopy","assets/images/loopy/loopy_temp.png");
	this.game.load.image("ground1","assets/images/decor/plateforme.png");
	this.game.load.image("background","assets/images/decor/background.png");
	this.game.load.image("coin","assets/images/objects/common/coin.png");
	this.game.load.spritesheet("goomba","assets/images/enemies/goomba.png",32,32,3);
}

LR.Loopy.State.LoadingState.prototype.create = function() {
	if (this.game.$routeParams.levelname && this.game.$routeParams.storage) {
		this.game.state.start("Level");
	} else {
		//this.game.state.start("Play);
		this.game.state.start("SelectionMenu");
	}
}

LR.Loopy.State.LoadingState.prototype.update = function() {
}

LR.Loopy.State.LoadingState.prototype.render = function() {
}
