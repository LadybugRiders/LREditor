"use strict";

/**
* Utilities for level import/export.
*
* @namespace LR
* @class LevelUtilities
* @constructor
*/
LR.LevelUtilities = function() {

};

LR.LevelUtilities.OBJECT_ATTRIBUTES = [
	"name", "x", "y", "width", "height", "angle", "behaviours", "layer", "visible",
	"key", "frame"
];

LR.LevelUtilities.TYPE_GAME_OBJECT = "GameObject";
LR.LevelUtilities.TYPE_SPRITE = "LR.Entity.Sprite";
LR.LevelUtilities.TYPE_TILESPRITE = "LR.Entity.TileSprite";
LR.LevelUtilities.TYPE_TEXT = "LR.Entity.Text";
LR.LevelUtilities.TYPE_GROUP = "LR.Entity.Group";
LR.LevelUtilities.TYPE_PHASER_GROUP = "Phaser.Group";
LR.LevelUtilities.TYPE_PHASER_WORLD = "Phaser.World";

LR.LevelUtilities.CreateEntityByType = function(_object, _game) {
	var entity = null;
	//console.log(_object);
	if (_object.type === LR.LevelUtilities.TYPE_SPRITE) {
		entity = new LR.Entity.Sprite(_game,0,0);	
		_game.add.existing(entity);
	} else if (_object.type === LR.LevelUtilities.TYPE_TILESPRITE) {
		entity = new LR.Entity.TileSprite(_game,0,0);
		_game.add.existing(entity);
	} else if (_object.type === LR.LevelUtilities.TYPE_GROUP) {
		entity = new LR.Entity.Group(_game);
		_game.add.existing(entity);
	} else if (_object.type === LR.LevelUtilities.TYPE_TEXT) {
		entity = new LR.Entity.Text(_game,0,0,"",_object.textData.style);
		_game.add.existing(entity);
	} else if (_object.type === LR.LevelUtilities.TYPE_PHASER_WORLD) {
		//entity = new Phaser.World(_game);
	}

	entity.go.id = _object.id;

	return entity;
}

LR.LevelUtilities.GetType = function(_object) {
	var type = "";

	if (_object.type == Phaser.SPRITE) {
		type = LR.LevelUtilities.TYPE_SPRITE;
	} else if (_object.type == Phaser.TILESPRITE){
		type = LR.LevelUtilities.TYPE_TILESPRITE;
	}else if (_object.type == Phaser.GROUP) {
		type = LR.LevelUtilities.TYPE_GROUP;
	}else if(_object.type == Phaser.TEXT){
		type = LR.LevelUtilities.TYPE_TEXT;
	} else if (_object instanceof Phaser.World) {
		type = "Phaser.World";
	}

	return type;
};

LR.LevelUtilities.IsEditorImage = function(_image) {
	var editorImage = false;

	if (typeof _image.name === "string") {
		if (_image.name[0] == "_" && _image.name[1] == "_") {
			editorImage = true;
		}
	}

	return editorImage;
};
