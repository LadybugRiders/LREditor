"use strict";

/**
* @author LadybugRiders
*/

/**
* Listen and dispatch events.
*
* How to use it:
* game.plugins.add(Phaser.Plugin.Pollinator);
* game.pollinator.on("myEvent", ...);
* ...
* ...
* ...
* game.pollinator.dispatch("myEvent");
*
* Warning: this class is a singleton.
*
* @namespace
* @class Pollinator
* @namespace Phaser.Plugin
* @constructor
*/
Phaser.Plugin.Pollinator = function(_game, _parent) {
	if (Phaser.Plugin.Pollinator.INSTANCE == null) {
		Phaser.Plugin.call(this, _game, _parent);

		this.router = new Object();

		Phaser.Plugin.Pollinator.INSTANCE = this;
		_game.pollinator = Phaser.Plugin.Pollinator.INSTANCE;
	}

	return Phaser.Plugin.Pollinator.INSTANCE;
};

Phaser.Plugin.Pollinator.prototype = Object.create(Phaser.Plugin);
Phaser.Plugin.Pollinator.prototype.constructor = Phaser.Plugin.Pollinator;

Phaser.Plugin.Pollinator.INSTANCE = null;

/**
* Map a callback on an event
*
* @method on
* @param {string} key Event's name
* @param {function} callback Function to be called when the event occurs
* @optional {object} callbackContext Callback's context
*/
Phaser.Plugin.Pollinator.prototype.on = function(_key, _callback, _callbackContext) {
	if (this.router[_key] == null) {
		this.router[_key] = new Array();
	}
	this.router[_key].push({
		callback: _callback,
		context: _callbackContext
	});
};

/**
* Unmap a callback on an event
*
* @method off
* @param {string} key Event's name
* @param {function} callback Function to be called when the event occurs
* @optional {object} callbackContext Callback's context
*/
Phaser.Plugin.Pollinator.prototype.off = function(_key, _callback, _callbackContext) {
	if (this.router[_key] != null) {
		var i;
		var found = false;
		var object = null;
		//Search each object of the array
		for(i = 0; i < this.router[_key].length; i++){
			object = this.router[_key][i];
			//if the callback & context are the same
			if( object.callback == _callback && object.context == _callbackContext ){
				//this is the object we are looking for
				found = true;
				break;
			}
		}
		if( found )
			this.router[_key].splice(i,1);
		}
};

/**
* Dispatch an event to all callback related to it
*
* @method dispatch
* @param {string} key Event's name
* @optional {object} args Parameters to send to callbacks
*/
Phaser.Plugin.Pollinator.prototype.dispatch = function(_key, _args) {
	if (this.router[_key]) {
		for (var i = 0; i < this.router[_key].length; i++) {
			var env = this.router[_key][i];
			if (typeof env.callback === "function") {
				if (env.context) {
					env.callback.call(env.context, _args);
				} else {
					env.callback(_args);
				}
			}
		};
	}
};

/**
* Destroy the instance of Pollinator
*
* @method destroy
*/
Phaser.Plugin.Pollinator.prototype.destroy = function() {
	this.router = null;
	Phaser.Plugin.Pollinator.INSTANCE = null;
};