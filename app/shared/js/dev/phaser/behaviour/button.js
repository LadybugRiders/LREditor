"use strict";

//>>LREditor.Behaviour.name: LR.Behaviour.Button
//>>LREditor.Behaviour.params : {"callbackName":"", "messageObject" : {}, "interactives":[], "activeCountLimit": 0}

/**
* Class Button
* When colliding with a valid body, it calls the function callbackName on the colliding gameobject, with messageObject as a parameter.
*
* @namespace Behaviour
* @class Button
* @constructor
* @param {GameObject} gameobject
*/
LR.Behaviour.Button = function(_gameobject){
	LR.Behaviour.call(this,_gameobject);
};

LR.Behaviour.Button.prototype = Object.create(LR.Behaviour.prototype);
LR.Behaviour.Button.prototype.constructor = LR.Behaviour.Button;

/**
* Called when the button entity is clicked
*
* @method onClick
*/
LR.Behaviour.Button.prototype.onClick = function() {
};