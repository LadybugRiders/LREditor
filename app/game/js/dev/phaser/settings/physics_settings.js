"use strict";
/**
* Holds properties about the current game physics, such as layers' data
* @class PhysicsSettings
*/
var PhysicsSettings = function(){

};

/**
* Value for static bodies
* @property STATIC
* @type {numer}
*/
PhysicsSettings.STATIC = Phaser.Physics.P2.Body.STATIC;
/**
* Value for dynamic bodies
* @property DYNAMIC
* @type {numer}
*/
PhysicsSettings.DYNAMIC = Phaser.Physics.P2.Body.DYNAMIC;
/**
* Value for kinematic bodies
* @property KINEMATIC
* @type {numer}
*/
PhysicsSettings.KINEMATIC = Phaser.Physics.P2.Body.KINEMATIC;

PhysicsSettings.LAYERS = {
	"default" : {"collisions" :[]},
	"player" : {"collisions" : ["death","ground","trigger_player"]},
	"ground" : {"collisions" : ["player"]},
	"death": {"collisions" : ["player"]},
	"trigger_player" : {"collisions" : ["player"]}
};

/**
* Global gravity of the game
* @property GLOBAL_GRAVITY
*/
PhysicsSettings.GLOBAL_GRAVITY = 600;

/**
* Static method that returns the array of collidables layers for the specified layer
* @method GetCollisionsForLayer
* @param {string} layerName
*/
PhysicsSettings.GetCollisionsForLayer = function(_layer){
	return PhysicsSettings.LAYERS[_layer].collisions;
}