"use strict";

/**
* Behaviour for a horizontal scroller
*
* @namespace Behaviour
* @class ScrollerHorizontal
* @constructor
* @param {GameObject} gameobject attached to the behavior
*/
LR.Editor.Behaviour.ScrollerHorizontal = function(_gameobject) {
	LR.Behaviour.call(this, _gameobject);

	_gameobject.inputEnabled = true;
	_gameobject.input.enableDrag();
	_gameobject.input.setDragLock(true, false);
	_gameobject.fixedToCamera = true;
	_gameobject.cameraOffset.y = 
		_gameobject.game.camera.height - _gameobject.height * 0.5;
};

LR.Editor.Behaviour.ScrollerHorizontal.prototype = Object.create(LR.Behaviour);
LR.Editor.Behaviour.ScrollerHorizontal.prototype.constructor = LR.Editor.Behaviour.ScrollerHorizontal;

/**
* Update the camera according to the gameobject x position
*
* @method update
*/
LR.Editor.Behaviour.ScrollerHorizontal.prototype.update = function() {
	LR.Behaviour.prototype.update.call(this);

	if (this.gameobject) {
		var go = this.go;

		var worldW = go.game.world.width;
		var cameraW = go.game.camera.width;
		var ratio = worldW / cameraW;

		// hide scroller if camera feets the world
		if (go.parent.visible == true) {
			if (ratio <= 1) {
				go.visible = false;
			} else {
				go.visible = true;
			}
		}

		// if dragged, move camera horizontally
		if (go.input.pointerDragged()) {
			if (go.cameraOffset.x < go.width * 0.5) {
				go.cameraOffset.x = go.width * 0.5;
			} else if (go.cameraOffset.x > (cameraW - go.width * 0.5)) {
				go.cameraOffset.x = (cameraW - go.width * 0.5);
			}

			if (ratio > 1) {
				var left = go.cameraOffset.x - go.width * 0.5;
				var newX = Math.round(left * ratio);
				go.game.camera.x = newX;
			}
		}
	}	
};