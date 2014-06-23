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
	var cObj = null;
	//console.log(_object);
	if (_object.type === LR.LevelUtilities.TYPE_SPRITE) {
		cObj = new LR.Entity.Sprite(_game,0,0);	
		_game.add.existing(cObj);
	} else if (_object.type === LR.LevelUtilities.TYPE_TILESPRITE) {
		cObj = new LR.Entity.TileSprite(_game,0,0);
		_game.add.existing(cObj);
	}else if (_object.type === LR.LevelUtilities.TYPE_GROUP) {
		cObj = new LR.Entity.Group(_game);
		_game.add.existing(cObj);
	}else if (_object.type === LR.LevelUtilities.TYPE_TEXT) {
		cObj = new LR.Entity.Text(_game,0,0,"");
		_game.add.existing(cObj);
	}else if (_object.type === LR.LevelUtilities.TYPE_PHASER_WORLD) {
		//cObj = new Phaser.World(_game);
	}	

	if( _object.body ){
		addBody(_object,cObj);
	}

	return cObj;
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

function addBody(_object,_entity){
	var motionState = Phaser.Physics.P2.Body.DYNAMIC;
	if( _object.body.motion === "STATIC"){
		motionState = Phaser.Physics.P2.Body.STATIC;
	}else if( _object.body.motion === "KINEMATIC"){
		motionState = Phaser.Physics.P2.Body.KINEMATIC;
	}
	_entity.go.enablePhysics(motionState);
}