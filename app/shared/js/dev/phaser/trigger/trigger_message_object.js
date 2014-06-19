"use strict";
/**
* Object that is sent as parameter in a trigger callback function.
* This is for showing the basic properties.
*
* @namespace Misc
* @class TriggerMessageObject
* @constructor
*/
LR.Misc.TriggerMessageObject = function(){
	/**
	* The GameObject holding the Trigger behaviour. Basically the sender of the message.
	*
	* @property sender
	* @type {GameObject}
	* @default null
	*/
	this.sender = null;
	/**
	* The shape of the sender that is in contact with the target's body
	*
	* @property senderShape
	* @type {P2.Shape}
	* @default null
	*/
	this.senderShape = null;
	/**
	* The shape of the body's target that is colliding with the sender's body
	*
	* @property collShape
	* @type {P2.Shape}
	* @default null
	*/
	this.collShape = null;
	/**
	* The contact equation of the collision
	*
	* @property equation
	* @type {P2.ContactEquation}
	* @default null
	*/
	this.equation = null;
}