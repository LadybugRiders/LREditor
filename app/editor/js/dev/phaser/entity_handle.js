"use strict";

//
// This behaviour is attached to the Group that goes over the selected object.
// It is unique in the game editor.
// It contains the two axis for moving the sprite.These are created when the behaviour is instanciated
//

LR.Editor.Behaviour.EntityHandle = function(_gameobject,_$scope) {
	LR.Behaviour.call(this, _gameobject);
	this.target = null;
	//this.entity.visible = false;

	this.$scope = _$scope;
	this.draggerX = false;	
	this.draggerY = false;

	//Select sprite
	this.selectSprite = this.entity.add( new LR.Entity.Sprite(_$scope.game,0,0,"__select") );
	this.selectSprite.anchor.setTo(0.5,0.5);
    //Handles axis
    this.axisX = this.entity.add(new LR.Entity.Sprite(_$scope.game,0,0,"__x_move"));
    this.axisX.anchor.setTo(0,0.5);
    this.axisX.name = "__xAxis";
    //AXIS X Input
    this.activateInputOnEntity(this.axisX);
    this.axisX.input.allowVerticalDrag = false;

    this.axisY = this.entity.add(new LR.Entity.Sprite(_$scope.game,0,0,"__y_move"));
    this.axisY.anchor.setTo(0.5,1);
    this.axisY.name = "__yAxis";
    //AXIS X Input
    this.activateInputOnEntity(this.axisY);
    this.axisY.input.allowHorizontalDrag = false;

    this.toggleAxises(false);

    var inputManager = this.entity.game.inputManager;
    //Full drag on CTRL
    inputManager.bindKeyPress("ctrl",this.activateTotalDrag, this );
    inputManager.bindKeyRelease("ctrl",this.deactivateTotalDrag, this );
    //Clone on C
    inputManager.bindKeyRelease("C",this.duplicate, this );

    this.totalDragActive = false;
};

LR.Editor.Behaviour.EntityHandle.prototype = Object.create(LR.Behaviour);
LR.Editor.Behaviour.EntityHandle.prototype.constructor = LR.Editor.Behaviour.EntityHandle;

/*
* Update the handle according to the gameobject position*
*/
LR.Editor.Behaviour.EntityHandle.prototype.update = function() {
	LR.Behaviour.prototype.update.call(this);

	if( this.target != null ){

		//if an axis handle is being dragged
		if( this.draggerX || this.draggerY ){
			if( this.draggerX ){
				this.axisY.x = this.axisX.x; this.axisY.y = this.axisX.y;
			}else{
				this.axisX.x = this.axisY.x; this.axisX.y = this.axisY.y;
			}
			this.placeTarget(this.target,this.selectSprite);
		}else if( this.totalDragActive ){
			this.updateSpritesStick();
		}

		this.$scope.forceAttributesRefresh(this.target);
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.activate = function(_target) {

	
	if( _target === this.target)
		return;

	if( _target.type === Phaser.GROUP ){
		console.log(_target);
		return;
	}

	this.selectSprite.anchor = _target.anchor;

	this.lastTarget = this.target;
	this.target = _target;

	//if there's a target
	if(this.target && this.target.input){
		//check if total drag is already active
		if( this.totalDragActive ){
			this.activateTotalDrag();
		}else{
			this.deactivateTotalDrag();
		}
	}
	//Display
	this.entity.visible = true;
	this.placeTarget(this.target, this.selectSprite);
}

LR.Editor.Behaviour.EntityHandle.prototype.deactivate = function() {	
	this.entity.visible = false;
	this.toggleAxises(false);
	if( this.target != null )
		this.lastTarget = this.target;
	this.target = null;
}

LR.Editor.Behaviour.EntityHandle.prototype.recoverLastTarget = function() {
	this.activate(this.lastTarget);
}

//=================================================================
//						DUPLICATE
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.duplicate = function(_key) {
	if( this.target && _key.altKey ){
		this.$scope.$emit("cloneEntityEmit",{ entity : this.target});
	}
}

//=================================================================
//						TOTAL DRAG
//=================================================================
LR.Editor.Behaviour.EntityHandle.prototype.activateTotalDrag = function() {	
    this.totalDragActive = true;
    if(this.target){
		this.selectSprite.alpha = 1;
		this.toggleAxises(false);
		this.target.go.sendMessage("activateTotalDrag")
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.deactivateTotalDrag = function() {
    this.totalDragActive = false;
    if(this.target){
		this.selectSprite.alpha = 0.5;
		this.toggleAxises(true);
		this.target.go.sendMessage("deactivateTotalDrag")

		//Replace axises
		this.axisX.x = this.target.x; this.axisX.y = this.target.y;
		this.axisY.x = this.target.x; this.axisY.y = this.target.y;
	}
}

//=================================================================
//						DRAG
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.startDrag = function(_sender) {
	if( _sender.key == "__x_move")
		this.draggerX = true;
	else
		this.draggerY = true;
}

LR.Editor.Behaviour.EntityHandle.prototype.stopDrag = function(_sender) {
	if( _sender.key == "__x_move")
		this.draggerX = false;
	else
		this.draggerY = false;
}

LR.Editor.Behaviour.EntityHandle.prototype.checkDrag = function() {
	if( ! this.entity.game.input.activePointer.withinGame ){
		console.log("quit");
		this.draggerX = false;
		this.draggerY = false;
	}
}

//=================================================================
//						OVER
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.inputOver = function(_sender,_pointer) {
	_sender.alpha = 1;
}

LR.Editor.Behaviour.EntityHandle.prototype.inputOut = function(_sender,_pointer) {
	_sender.alpha = 0.7;
}

LR.Editor.Behaviour.EntityHandle.prototype.toggleAxises = function(_visible){
	this.axisY.visible = _visible;
	this.axisX.visible = _visible;
}

LR.Editor.Behaviour.EntityHandle.prototype.activateInputOnEntity = function(_entity){	
	_entity.inputEnabled = true;
	_entity.input.enableDrag();
	_entity.input.useHandCursor = true;
	_entity.input.priorityID = 10000;
	_entity.alpha = 0.7;
	//events
    _entity.events.onDragStart.add(this.startDrag, this);
    _entity.events.onDragStop.add(this.stopDrag, this);
    _entity.events.onInputOver.add(this.inputOver, this);
    _entity.events.onInputOut.add(this.inputOut, this);
}

// This will place the targetted object at its right place, according to the handle position
LR.Editor.Behaviour.EntityHandle.prototype.placeTarget = function(_target,_selectSprite,_offset){
	if( _offset == null )
		_offset = new Phaser.Point();
	//keep size up to date
	_selectSprite.width = _target.width;
	_selectSprite.height = _target.height;

	//place Target with its offset
	_target.go.setPosition(this.axisX.x + _offset.x ,
								this.axisX.y + _offset.y );
	//place selection sprite
	_selectSprite.x = _target.x;
	_selectSprite.y = _target.y;
}

LR.Editor.Behaviour.EntityHandle.prototype.updateSpritesStick = function(){
	this.selectSprite.x = this.target.x;
	this.selectSprite.y = this.target.y;
}