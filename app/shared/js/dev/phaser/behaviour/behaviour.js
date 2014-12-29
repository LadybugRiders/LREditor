"use strict";

/**
* Script attached to a GameObject. Its update method is called every frame if the object exists.
* 
* @namespace LR
* @class Behaviour
* @constructor
* @param {GameObject} gameobject The GameObject this behaviour is attached to
*/
LR.Behaviour = function(_gameobject, _args) {
	/**
	* Enables the behaviour. A disabled behaviour will not have its start(),update(), render() and contacts function called by its GameObject
	*
	* @property enabled
	* @type {boolean}
	* @default true
	*/
	this.enabled = true;
	
	/**
	* The GameObject this Behaviour is attached to
	*
	* @property gameobject
	* @type {GameObject}
	*/
	this.go = _gameobject;

	/**
	* The Entity of the GameObject
	*
	* @property entity
	* @type {LR.Entity}
	*/
	this.entity = _gameobject.entity;

	/**
	* Arguments to the behaviour. Must be used in Behaviour.create
	*
	* @property args
	* @type object
	* @default null
	*/
	this.args = _args;

	/**
	* If this property is set to false, the behaviours won't be noticed of contact events anymore
	* ie : onBeginContact and onEndContact will not be triggered
	*
	* @property enableEvents
	* @type boolean
	* @default true
	*/
	this.enableEvents = true;
};

LR.Behaviour.prototype.constructor = LR.Behaviour;

/**
* Called when all gameobjects are created
*
* @method create
*/
LR.Behaviour.prototype.create = function() {
};

/**
* Called each frame if the behaviour is enabled
*
* @method update
*/
LR.Behaviour.prototype.update = function() {

};

/**
* Called each frame after updaet() if the behaviour is enabled
*
* @method postUpdate
*/
LR.Behaviour.prototype.postUpdate = function() {

};

LR.Behaviour.prototype.render = function() {

};

/**
* Called when the scene is launching. All objects are created then.
*
* @method start
*/
LR.Behaviour.prototype.start = function() {
};

/**
* Called when the GameObject is destroyed
*
* @method destroy
*/
LR.Behaviour.prototype.destroy = function(){

}
/**
* Enable the behaviour
*
* @method enable
*/
LR.Behaviour.prototype.enable = function(){
	this.enabled = true;
}

/**
* Disable the behaviour. A disabled behaviour won't have his update function called anymore
*
* @method disable
*/
LR.Behaviour.prototype.disable = function(){
	this.enabled = false;
}

/**
* Called when a body collision just begins
*
* @method onBeginContact
* @param {_otherBody} _otherBody
* @param {_myShape} _myShape
* @param {_otherShape} _otherShape
* @param {_equation} _equation
*/
LR.Behaviour.prototype.onBeginContact = function(_otherBody, _myShape, _otherShape, _equation){

}

LR.Behaviour.prototype.onContact = function(_otherBody){

}

/**
* Called when a body collision just ends
*
* @method onEndContact
* @param {_otherBody} _otherBody
* @param {_myShape} _myShape
* @param {_otherShape} _otherShape
* @param {_equation} _equation
*/
LR.Behaviour.prototype.onEndContact = function(_otherBody, _myShape, _otherShape, _equation){
	
}

//============================================================
//						CUTSCENE
//============================================================
/**
* Called when a cutscene begins
*
* @method onBeginCutscene
*/
LR.Behaviour.prototype.onBeginCutscene = function(){

}

/**
* Called when a cutscene ends
*
* @method onEndCutscene
*/
LR.Behaviour.prototype.onEndCutscene = function(){
	
}

/**
* Accessor to the GameObject's x property
*
* @property x
* @type Number
*/
Object.defineProperty( LR.Behaviour.prototype, "x",
	{
		get : function(){
			console.log("caca");
			return this.go.x;
		},

		set:  function(_value){
			this.go.x = _value;
		}
	}
);

/**
* Accessor to the GameObject's y property
*
* @property x
* @type Number
*/
Object.defineProperty( LR.Behaviour.prototype, "y",
	{
		get : function(){
			return this.go.y;
		},

		set:  function(_value){
			this.go.y = _value;
		}
	}
);

/**
* Accessor to the entity's world coordinates property (readonly)
*
* @property world
* @type {Phaser.Point}
*/
Object.defineProperty( LR.Behaviour.prototype, "world",
	{
		get : function(){
			return this.entity.world;
		}
	}
);


/**
* Accessor to the current game (readonly)
*
* @property game
* @type Number
*/
Object.defineProperty( LR.Behaviour.prototype, "game",
	{
		get : function(){
			return this.entity.game;
		}
	}
);

/**
* Accessor to the current gameobject's body (readonly)
*
* @property body
* @type LR.Body
*/
Object.defineProperty( LR.Behaviour.prototype, "body",
	{
		get : function(){
			return this.entity.body;
		}
	}
);

/**
* Find an instance of a specific Behaviour held by a gameobject 
*
* @method FindBehaviour
* @param {Phaser.World | Phaser.Group | Phaser.Sprite} root Root of the search
* @param {Class} Behaviour's class
* @return {GameObject} Found gameobject
*/
LR.Behaviour.Find = function(_root, _behaviour) {
	var behaviour = null;

	behaviour = _root.go.getBehaviour(_behaviour);

	if (!behaviour && _root.children) {
		var i = 0;
		while (i < _root.children.length && behaviour == null) {
			var child = _root.children[i];
			behaviour = LR.GameObject.FindBehaviour(child, _behaviour)
			i++;
		}
	}

	return behaviour;
};