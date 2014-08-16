"use strict";

/**
* @class LR
*/
var LR = function(){};
LR.Entity = function(){};
LR.Misc = function(){};

//UI
LR.UI = function(){}
LR.UI.Behaviour = function(){}

/**
* Find a entity by its GameObject name
*
* @method FindByName
* @param {Phaser.World | Phaser.Group | Phaser.Sprite} root Root of the search
* @param {string} name Gameobject's name
* @return {Phaser.World | Phaser.Group | Phaser.Sprite} Found entity
*/
LR.Entity.FindByName = function(_root, _name) {
	var entity = null;

	if (_root && _root.go && _root.go.name === _name) {
		entity = _root;
	} else {
		if (_root.children) {
			var i = 0;
			while (i < _root.children.length && entity == null) {
				var child = _root.children[i];
				if (LR.Entity.FindByName(child, _name)) {
					entity = child;
				}

				i++;
			};
		}
	}
	return entity;
};

/**
* Find a entity by its GameObject ID
*
* @method FindByID
* @param {Phaser.World | Phaser.Group | Phaser.Sprite} root Root of the search
* @param {Number} name Gameobject's ID
* @return {Phaser.World | Phaser.Group | Phaser.Sprite} Found entity
*/
LR.Entity.FindByID = function(_root, _id) {
	var entity = null;
	if (_root && _root.go && _root.go.id === _id) {
		entity = _root.go;
	} else {
		if (_root.children) {
			var i = 0;
			while (i < _root.children.length && entity == null) {
				var child = _root.children[i];
				var go = LR.Entity.FindByID(child, _id);
				if (go) {
					entity = go;
				}

				i++;
			};
		}
	}
	return entity;
};