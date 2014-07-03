"use strict";

var Entity = require('./entity');
var FileManager = require('./file_manager');

/**
* ListedEntity
*
* @class ListedEntity
* @constructor
* @param {string} root path
* @param {Express} express application
*/
var ListedEntity = function(_root, _app) {
	Entity.call(this, _root, _app);
};

ListedEntity.prototype = Object.create(Entity.prototype);
ListedEntity.prototype.constructor = ListedEntity;

/**
* ListedEntity key
*
* @property KEY
* @type string
* @default "inputs"
*/
ListedEntity.KEY = "listed_entity";

/**
* Get the entity's path
*
* @method getPath
*/
ListedEntity.prototype.getPath = function() {
	return this.root + '/' + ListedEntity.KEY;
};

/**
* Routes the entity
*
* @method routing
*/
ListedEntity.prototype.routing = function() {
	var instance = this;
	this.app.get(this.getPath(), function(req, res) {
		var path = "./app" + req.query.path;
		FileManager.List(path, {recursive: false}, function(error, files) {
			res.end();
		});
	});
};

module.exports = ListedEntity;