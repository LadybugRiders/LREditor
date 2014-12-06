"use strict";

/**
* Load and Manage a DialogManager.
*
* @class DialogManager
* @namespace Phaser.Plugin
* @constructor
* @param {Phaser.Game} game
*/
Phaser.Plugin.DialogManager = function( _game, _parent ){
	this.game = _game;

	if (Phaser.Plugin.DialogManager.INSTANCE == null) {
		Phaser.Plugin.call(this, _game, _parent);

		Phaser.Plugin.DialogManager.INSTANCE = this;
		_game.dialogManager = Phaser.Plugin.DialogManager.INSTANCE;
	}

	this.state = "IDLE";

	this.dialogBoxScript = null;

	this.onEndCallback = null;
	this.onEndContext = null;

	return Phaser.Plugin.DialogManager.INSTANCE;
}

Phaser.Plugin.DialogManager.prototype = Object.create(Phaser.Plugin);
Phaser.Plugin.DialogManager.prototype.constructor = Phaser.Plugin.DialogManager;

Phaser.Plugin.DialogManager.prototype.update = function(){

}

Phaser.Plugin.DialogManager.prototype.activate = function(_text, _callback, _context){
	//if there's no existing dialog box
	if( this.dialogBoxScript == null ){
		//Create a new basic one
		var dBGroup = new LR.Entity.Group(this.game);
		this.dialogBoxScript = new LR.UI.Behaviour.DialogBox(dBGroup.go);
		this.dialogBoxScript.createBasic();
		//Add group to game
		this.game.state.getCurrentState().addGameObject(dBGroup.go,true);
		//set callbacks
		this.dialogBoxScript.setEndCallback( this.onDialogBoxDismissed, this ) ;
	}
	//callback to call when the dialog box is dismissed
	this.onEndCallback = _callback;
	this.onEndContext = _context;

	this.dialogBoxScript.setValidInput("valid");

	this.dialogBoxScript.setText( _text );
}

Phaser.Plugin.DialogManager.prototype.onDialogBoxDismissed = function(){
	if( this.onEndCallback )
		this.onEndCallback.call(this.onEndContext);
}