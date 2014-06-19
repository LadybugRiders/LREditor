"use strict";

LR.Loopy.Behaviour.CameraFollow = function(_gameobject, _args){	
	LR.Behaviour.call(this,_gameobject, _args);
	
	/**
	* GameObject named "loopy"
	*
	* @property loopy
	* @type GameObject
	* @default null
	*/
	this.loopy = null;

	this.entity.game.camera.setBoundsToWorld();
};


LR.Loopy.Behaviour.CameraFollow.prototype = Object.create(LR.Behaviour.prototype);
LR.Loopy.Behaviour.CameraFollow.prototype.constructor = LR.Loopy.Behaviour.CameraFollow;

/**
* Get gameobject loopy and follow it
*
* @method create
*/
LR.Loopy.Behaviour.CameraFollow.prototype.create = function() {
	if (this.args) {
		if (this.args.follow) {
			this.loopy = LR.GameObject.FindByName(this.entity.game.world, this.args.follow);
			if (this.loopy) {
				var camera = this.entity.game.camera;
				camera.follow(this.loopy);
				camera.deadzone = new Phaser.Rectangle(
					camera.width * 0.25,
					camera.height * 0.25,
					camera.width * 0.5,
					camera.height * 0.5
				);
			} else {
				console.warn("NOT FOUND: " + this.args.follow);
			}
		}
	} else {
		console.warn("No arguments");
	}
};

/**
* Update the camera
*
* @method update
*/
LR.Loopy.Behaviour.CameraFollow.prototype.update = function(){

}
