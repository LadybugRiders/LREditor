"use strict";

LR.FX.Blink = function(_gameobject) {
	this.go = _gameobject;
};

LR.FX.Blink.prototype.activate = function(_times, _duration, _alphaMin, _alphaMax) {
	this.times = 1 * 2;
	if (_times) this.times = _times * 2;

	this.duration = 1000;
	if (_duration) this.duration = _duration;
	this.duration /= this.times;

	this.alphaMin = 0.5;
	if (_alphaMin) this.alphaMin = _alphaMin;

	this.alphaMax = 1;
	if (_alphaMax) this.alphaMax = _alphaMax;

	this.reset();

	this.step();
};

LR.FX.Blink.prototype.step = function() {
	if (this.times > 0) {
		var properties = {alpha: this.alphaMax}
		if (this.times % 2 == 0)
			properties = {alpha: this.alphaMin};

		this.tween = this.go.game.add.tween(this.go.entity).to(
			properties,
			this.duration * 0.5,
			Phaser.Easing.Sinusoidal.InOut
		);

		this.tween.onComplete.add(this.step, this);

		this.tween.start();

		this.times--;
	}
};

LR.FX.Blink.prototype.reset = function(_times, _duration) {
	if (this.tween)
		if (this.tween.isRunning)
			this.tween.stop();

	this.go.entity.alpha = 1;
};

