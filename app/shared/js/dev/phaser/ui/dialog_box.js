"use strict";

/**
* Dialog box used by the Phaser.Plugin.DialogManager to display text
* It creates a LR.Entity.Text and a LR.Entity.Sprite
* Attach this behaviour on a LR.Entity.Group
*
* @namespace UI
* @class DialogBox
* @constructor
* @param {Phaser.Game} game
*/
LR.UI.Behaviour.DialogBox = function(_gameobject){
	LR.Behaviour.call(this, _gameobject);

	this.height = 100;
	this.screenPadding = 5;

	this.width = this.entity.game.camera.view.width - this.screenPadding * 2;

	this.textOffset = new Phaser.Point();
	this.textOffset.x = 5;
	this.textOffset.y = this.textOffset.x;

	this.target = null;

	this.active = false;
	if(this.entity.game.inputManager){
		this.entity.game.inputManager.bindMousePress(this.onValid,this,Phaser.Mouse.LEFT_BUTTON,0);
	}
};

LR.UI.Behaviour.DialogBox.prototype = Object.create(LR.Behaviour.prototype);
LR.UI.Behaviour.DialogBox.prototype.constructor = LR.UI.Behaviour.DialogBox;

LR.UI.Behaviour.DialogBox.prototype.create = function( _data ){
	this.createBasic();
}

LR.UI.Behaviour.DialogBox.prototype.setText = function( _text ){
	this.activate();
	this.textEntity.text = _text;
}

LR.UI.Behaviour.DialogBox.prototype.setValidInput = function( _inputName ){
	if( this.entity.game.inputManager){
		this.entity.game.inputManager.bindKeyPress(_inputName,this.onValid,this,0);
	}
}

LR.UI.Behaviour.DialogBox.prototype.onValid = function(){
	if( this.active && this.onEndCallback != null ){
		this.onEndCallback.call(this.onEndContext);
		this.deactivate();
		return true;
	}
	return false;
}

LR.UI.Behaviour.DialogBox.prototype.activate = function(){
	this.entity.visible = true;
	this.active = true;
	if( this.target == null){
		this.entity.fixedToCamera = true;
		//camera offset of the whole dialog box
		this.entity.cameraOffset.x = this.screenPadding;
		this.entity.cameraOffset.y = this.screenPadding;
		//offset of the text
		this.textEntity.x = this.textOffset.x;
		this.textEntity.y = this.textOffset.y;
	}else{

	}
}

LR.UI.Behaviour.DialogBox.prototype.deactivate = function(){
	this.entity.visible = false;
	this.active = false;
}

LR.UI.Behaviour.DialogBox.prototype.setEndCallback = function(_callback,_context){
	this.onEndCallback = _callback;
	this.onEndContext = _context;
}

/**
* This creates a default dialog box at the top of the screen, fixed to camera
*/
LR.UI.Behaviour.DialogBox.prototype.createBasic = function(){

	//Create Background
    this.background = this.entity.game.add.graphics(0, 0);

    // set a fill and line style
    this.background.beginFill(0xFF3300);
    this.background.lineStyle(10, 0x000000, 1);
	 // draw a rectangle
    this.background.lineStyle(2, 0xFFFFFF, 1);
    this.background.drawRect(0, 0, 
    						this.width, this.height);
	this.entity.add(this.background);

	//Create Text
	this.textEntity = new LR.Entity.Text(this.entity.game,0,0,"text",
									{ font: "25px Arial", fill: "#ffffff", align: "left" }, //style
									"dialog_box_text");
	//Format 
	this.textEntity.wordWrap = true;
	this.textEntity.wordWrapWidth = this.width * 0.9;

	this.entity.add(this.textEntity);

	this.onEndCallback = null;
	this.onEndContext = null;

}