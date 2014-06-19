"use strict";

/**
* Behaviour for a vertical scroller
*
* @namespace Behaviour
* @class LR.Editor.Behaviour.ScrollerVertical
* @constructor
* @param {GameObject} gameobject attached to the behavior
*/
LR.Editor.Behaviour.ScrollerVertical = function(_gameobject) {
	LR.Behaviour.call(this, _gameobject);

	_gameobject.inputEnabled = true;
	_gameobject.input.enableDrag();
	_gameobject.input.setDragLock(false, true);
	_gameobject.fixedToCamera = true;
	_gameobject.cameraOffset.x =
		_gameobject.game.camera.width - _gameobject.width * 0.5;
};

LR.Editor.Behaviour.ScrollerVertical.prototype = Object.create(LR.Behaviour);
LR.Editor.Behaviour.ScrollerVertical.prototype.constructor = LR.Editor.Behaviour.ScrollerVertical;

/**
* Update the camera according to the gameobject y position
*
* @method update
*/
LR.Editor.Behaviour.ScrollerVertical.prototype.update = function() {
	LR.Behaviour.prototype.update.call(this);

	if (this.gameobject) {
		var go = this.go;

		var worldH = go.game.world.height;
		var cameraH = go.game.camera.height;
		var ratio = worldH / cameraH;

		// hide scroller if camera feets the world
		if (go.parent.visible == true) {
			if (ratio <= 1) {
				go.visible = false;
			} else {
				go.visible = true;
			}
		}

		// if dragged, move camera vertically
		if (go.input.pointerDragged()) {
			if (go.cameraOffset.y < go.height * 0.5) {
				go.cameraOffset.y = go.height * 0.5;
			} else if (go.cameraOffset.y > (cameraH - go.height * 0.5)) {
				go.cameraOffset.y = (cameraH - go.height * 0.5);
			}

			if (ratio > 1) {
				var top = go.cameraOffset.y - go.height * 0.5;
				var newY = Math.round(top * ratio);
				go.game.camera.y = newY;
			}
		}
	}	
};