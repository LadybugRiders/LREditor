"use strict";

/**
* The extended version of Phaser.Physics.P2.Body
* Used for physics instead of Phaser.Physics.P2.Body
*
* @class Body
* @namespace LR
* @constructor
* @param {_game} param_description
*/
LR.Body = function (_game, _sprite, _x, _y, _mass){
	/**
	* The local position of the body in its parent reference
	*
	* @property localPosition
	* @type {Phaser.Point}
	*/
	this.localPosition = new Phaser.Point(_x,_y);
	this.lastPosition = new Phaser.Point(_x,_y);
	Phaser.Physics.P2.Body.call(this,_game,_sprite,_x,_y,_mass);

    this.localRotation = 0;
    this.localRotationOffset = new Phaser.Point();

	this.worldPosition = new Phaser.Point();

	//Tells if the sprite can rotate indepently from its body
	this._bindRotation = false;

	//offset to add to the sprite angle if bound
	this._offsetRotation = 0;

}

LR.Body.prototype = Object.create(Phaser.Physics.P2.Body.prototype);
LR.Body.prototype.constructor = LR.Body;

LR.Body.prototype.postUpdate = function () { 

	//Add delta between the last body world position and the new one
	//to the localPosition
	this.localPosition.x += (this.worldX - this.lastPosition.x);
	this.localPosition.y += (this.worldY - this.lastPosition.y);


	//try getting world Postion of the parent
	var worldPos = new Phaser.Point();
	if(this.sprite.parent != this.sprite.game.world){
		worldPos.x = this.sprite.parent.world.x;
		worldPos.y = this.sprite.parent.world.y;
        //rotate
        var posR = LR.Utils.rotatePoint(this.localPosition,this.sprite.parent.worldAngle);
        this.localRotationOffset = Phaser.Point.subtract( posR , this.localPosition );    
    }

	//compute new world position from parentWorldPos + local Body position
	this.worldPosition.x = worldPos.x + this.localPosition.x + this.localRotationOffset.x;
	this.worldPosition.y = worldPos.y + this.localPosition.y + this.localRotationOffset.y;

	//affect P2 body world position
	this.data.position[0] = this.world.pxmi(this.worldPosition.x);			
	this.data.position[1] = this.world.pxmi(this.worldPosition.y);
	
    //Reposition Sprite
    this.sprite.x = this.localPosition.x;
    this.sprite.y = this.localPosition.y;

 	//Keep last world position (pixels)
	this.lastPosition.x = this.worldPosition.x;
	this.lastPosition.y = this.worldPosition.y;

    //ROTATION
    this.data.angle = ( this.localRotation + (this.sprite.parent.worldAngle || 0) ) * Math.PI / 180;

    if (!this.fixedRotation && this.bindRotation){
        this.sprite.rotation = this.data.angle + this._offsetRotation;
    }

    if (this.static == true)
        this.data.updateAABB();

    if( this.debugBody){
        this.debugBody.x = this.worldPosition.x;
        this.debugBody.y = this.worldPosition.y;
    }

}

// Called when the scene is launching. All objects are created then.
LR.Body.prototype.onSpriteAddedToGroup = function(_sprite,_group) { 
	this.localPosition = new Phaser.Point(_sprite.x,_sprite.y);

    this.postUpdate();
    _group.updateTransform();
    this.data.updateAABB();
};

/**
* The local x coordinate of the body
*
* @property x
* @type {Number}
*/
Object.defineProperty(LR.Body.prototype, "x", {

    get: function () {
        return this.localPosition.x;

    },

    set: function (value) {
    	this.localPosition.x = value;
    }

});

/**
* The local y coordinate of the body
*
* @property y
* @type {Number}
*/
Object.defineProperty(LR.Body.prototype, "y", {

    get: function () {

        return this.localPosition.y;

    },

    set: function (value) {
    	this.localPosition.y = value;
    }

});

/**
* The world x coordinate of the body
*
* @property worldX
* @type {Number}
*/
Object.defineProperty(LR.Body.prototype, "worldX", {

    get: function () {

        return this.world.mpxi(this.data.position[0]);

    },

    set: function (value) {
    	if( _sprite.parent.world)
    		value -= _sprite.parent.world.x;
    	this.localPosition.x = value;
    }

});

/**
* The world y coordinate of the body
*
* @property worldY
* @type {Number}
*/
Object.defineProperty(LR.Body.prototype, "worldY", {

    get: function () {
        return this.world.mpxi(this.data.position[1]);

    },

    set: function (value) {
    	if( _sprite.parent.world)
    		value -= _sprite.parent.world.y;
    	this.localPosition.y = value;
    }

});
/**
* Tells if the sprite can rotate indepently from its body
*
* @property bindRotation
* @type boolean
* @default false
*/
Object.defineProperty(LR.Body.prototype, "bindRotation", {

    get: function () {
        return this._bindRotation;
    },

    set: function (value) {
    	
    	this._bindRotation = value;
    	if(value == true && this._bindRotation == false) {
    		this._offsetRotation = this.sprite.angle;
        }
    }

});

Object.defineProperty(LR.Body.prototype, "angle", {

    get: function () {
        return this.localRotation;
    },

    set: function (value) {
        this.localRotation = value;
    }

});