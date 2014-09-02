"use strict";

LR.Body = function (_game, _sprite, _x, _y, _mass){
	this.localPosition = new Phaser.Point(_x,_y);
	this.lastPosition = new Phaser.Point(_x,_y);
	Phaser.Physics.P2.Body.call(this,_game,_sprite,_x,_y,_mass);

	this.worldPosition = new Phaser.Point();
}

LR.Body.prototype = Object.create(Phaser.Physics.P2.Body.prototype);
LR.Body.prototype.constructor = LR.Body;

LR.Body.prototype.postUpdate = function () {

	this.localPosition.x += (this.x - this.lastPosition.x) ;
	this.localPosition.y += (this.y - this.lastPosition.y);

	//try getting world Postion of the parent
	var worldPos = new Phaser.Point();
	if(this.sprite.parent != this.sprite.game.world){
		worldPos.x = this.sprite.parent.world.x;
		worldPos.y = this.sprite.parent.world.y;
	}

	//compute world position from parentWorldPos + local Body position
	this.worldPosition.x = worldPos.x + this.localPosition.x;
	this.worldPosition.y = worldPos.y + this.localPosition.y;

	//affect P2 body world position
	this.data.position[0] = this.game.physics.p2.pxmi(this.worldPosition.x);			
	this.data.position[1] = this.game.physics.p2.pxmi(this.worldPosition.y);
		
	//Reposition Sprite
    this.sprite.x = this.localPosition.x
    this.sprite.y = this.localPosition.y;

 	//Keep last world position (pixels)
	this.lastPosition.x = this.worldPosition.x;
	this.lastPosition.y = this.worldPosition.y;

    if (!this.fixedRotation)
    {
        this.sprite.rotation = this.data.angle;
    }

}

// Called when the scene is launching. All objects are created then.
LR.Body.prototype.onSpriteAddedToGroup = function(_sprite,_group) {		
	this.lastParentPos = new Phaser.Point(_group.x,_group.y);
	this.localPosition = new Phaser.Point(_sprite.x,_sprite.y);
	this.lastPosition = new Phaser.Point(_sprite.x,_sprite.y);
};

/**
* @name Phaser.Physics.P2.Body#x
* @property {number} x - The x coordinate of this Body.
*/
Object.defineProperty(LR.Body.prototype, "x", {

    get: function () {

        return this.world.mpxi(this.data.position[0]);

    },

    set: function (value) {
    	this.localPosition.x = value;
    }

});

Object.defineProperty(LR.Body.prototype, "y", {

    get: function () {

        return this.world.mpxi(this.data.position[1]);

    },

    set: function (value) {
    	this.localPosition.y = value;
    }

});