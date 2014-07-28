"use strict";

//>>LREditor.Behaviour.name: LR.Behaviour.Trigger
//>>LREditor.Behaviour.params : {"callbackName":"", "messageObject" : {}, "interactives":[], "activeCountLimit": 0}

/**
* Class Trigger
* When colliding with a valid body, it calls the function callbackName on the colliding gameobject, with messageObject as a parameter.
*
* @namespace Behaviour
* @class Trigger
* @constructor
* @param {GameObject} gameobject
*/
LR.Behaviour.Trigger = function(_gameobject){
	LR.Behaviour.call(this,_gameobject);
	
	_gameobject.enableEvents();

	/**
	* Interactive Layers that will trigger the callback. If empty, all layers can be interactives.
	* Note that collision the trigger's layer and the interactives' one has to be active ( see CollisionManager)
	* In short, this is used to filter the layers that will trigger the message
	*
	* @property interactives
	* @type {Array}
	* @default Array
	*/
	this.interactives = new Array();

	/**
	* Function that will be called onto the colliding object
	*
	* @property callbackName
	* @type {string}
	* @default onTrigger
	*/
	this.callbackName = "die";

	/**
	* The message data we want to attach when we notify the gameobject it has hit the trigger.
	*
	* @property messageObject
	* @type {TriggerMessageObject}
	* @default Object instance
	*/
	this.messageObject = new LR.Misc.TriggerMessageObject();

	/**
	* Tells how many times the trigger has been activated
	*
	* @property activeCount
	* @type Number
	* @default 0
	*/
	this.activeCount = 0;

	/**
	* Defines how many times the trigger can be activated.
	* 0 is unlimited
	*
	* @property activeCountLimit
	* @type Number
	* @default -1
	*/
	this.activeCountLimit = 0;

}

LR.Behaviour.Trigger.prototype = Object.create(LR.Behaviour.prototype);
LR.Behaviour.Trigger.prototype.constructor = LR.Behaviour.Trigger;

/**
* Creation data properties :
* messageObject - If you want the message sent to the colliding GameObject to have custom properties,
*                 put here an object containing these properties ie : _data.messageObject = { "customProp":"hello"}
* callbackName - See property
* interactives - See porperty
*
* @method create
* @param {Object} data 
*/
LR.Behaviour.Trigger.prototype.create = function(_data){
	if( _data == null )
		return;

	if( _data.messageObject){
		this.messageObject = _data.messageObject;
	}
	this.callbackName = _data.callbackName;
	if( _data.interactives ){
		this.interactives = _data.interactives;
	}

	if( _data.activeCountLimit ){
		this.activeCountLimit = _data.activeCountLimit;
	}
}


LR.Behaviour.Trigger.prototype.onBeginContact = function(_otherBody, _myShape, _otherShape, _equation){
	if( _otherBody == null )
		return;
	//check if a limit has been declared
	if( this.activeCountLimit > 0 && this.activeCount >= this.activeCountLimit ){
		return;
	}
	//if no interactives is assigned, the default behaviour acts on all layers
	if( this.interactives.length == 0){
		this.sendData(_otherBody, _myShape, _otherShape, _equation);
	}else{
		//check if the colliding body is an interactive one 
		for( var i=0; i < this.interactives.length ; i++){
			//if so, send "die" message to the gameobject
			if(this.interactives[i] == _otherBody.go.layer){
				this.activeCount ++;
				this.sendData(_otherBody, _myShape, _otherShape, _equation);
			}
		}
	}
}

LR.Behaviour.Trigger.prototype.sendData = function(_otherBody, _myShape, _otherShape, _equation){
	//Creates data to send
	this.messageObject.sender = this.go;
	this.messageObject.senderShape = _myShape;
	this.messageObject.collShape = _otherShape;
	this.messageObject.equation = _equation;

	if( this.callbackName != null )
		_otherBody.go.sendMessage(this.callbackName,this.messageObject);

	//call internal function
	this.onTriggered(_otherBody.go);
}

/**
* Called when the trigger is activated and messages are triggered
*
* @method onTriggered
* @param {LR.GameObject} _gameobject Message's target (also the GameObject that collided with this trigger)
*/
LR.Behaviour.Trigger.prototype.onTriggered = function(_gameobject){
}