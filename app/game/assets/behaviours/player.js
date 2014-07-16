"use strict";

//>>LREditor.Behaviour.name: Player

var Player = function(_gameobject) {
	LR.Behaviour.call(this, _gameobject);

  this.speed = 60;

	this.cursors = this.go.game.input.keyboard.createCursorKeys();
};

Player.prototype = Object.create(LR.Behaviour.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
	if (this.cursors.left.isDown) {
  	this.go.body.moveLeft(this.speed);

  	if (this.go.entity.scale.x < 0) {
  		this.go.entity.scale.x = 1;
  	}
  } else if (this.cursors.right.isDown) {
  	this.go.body.moveRight(this.speed);

  	if (this.go.entity.scale.x > 0) {
  		this.go.entity.scale.x = -1;
  	}
  }

  if (this.cursors.up.isDown) {
  	this.go.body.moveUp(200);
  }
}