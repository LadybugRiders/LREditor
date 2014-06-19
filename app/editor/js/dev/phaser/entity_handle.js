"use strict";

//
// This behaviour is attached to the sprite/object that goes over the selected object.
// It is unique in the game editor.
//

LR.Editor.Behaviour.EntityHandle = function(_gameobject,_$scope) {
	LR.Behaviour.call(this, _gameobject);
	this.target = null;
	this.entity.anchor.setTo(0.5,0.5);
	this.entity.visible = false;

	this.$scope = _$scope;
	this.draggerX = false;	
	this.draggerY = false;

    //Handles axis
    this.axisX = this.$scope.game.add.sprite(100,100,"x_move");
    this.axisX.anchor.setTo(0,0.5);
    this.axisX.name = "__xAxis";
    //AXIS X Input
    this.activateInputOnEntity(this.axisX);
    this.axisX.input.allowVerticalDrag = false;
    this.$scope.$emit("moveEntityToEditorEmit",{ entity : this.axisX});

    this.axisY = this.$scope.game.add.sprite(100,100,"y_move");
    this.axisY.anchor.setTo(0.5,1);
    this.axisY.name = "__yAxis";
    //AXIS X Input
    this.activateInputOnEntity(this.axisY);
    this.axisY.input.allowHorizontalDrag = false;
    this.$scope.$emit("moveEntityToEditorEmit",{ entity : this.axisY});

    this.toggleAxises(false);

    var inputManager = this.entity.game.inputManager;
    //Full drag on CTRL
   inputManager.bindKeyPress("ctrl",this.activateTotalDrag, this );
   inputManager.bindKeyRelease("ctrl",this.deactivateTotalDrag, this );
   //Clone on D
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
		//keep size up to date
		this.entity.width = this.target.width;
		this.entity.height = this.target.height;
		//replace entity
		this.entity.x = this.target.x; this.entity.y = this.target.y;

		//if an axis handle is being dragged
		if( this.draggerX ){
			this.target.go.setPosition(this.axisX.x,this.axisX.y);
			this.axisY.x = this.target.x; this.axisY.y = this.target.y;
			//this.checkDrag();
		}else if( this.draggerY ){
			this.target.go.setPosition(this.axisY.x,this.axisY.y);
			this.axisX.x = this.target.x; this.axisX.y = this.target.y;
			//this.checkDrag();
		}else{			
			//Replace axis
			this.axisX.x = this.target.x; this.axisX.y = this.target.y;
			this.axisY.x = this.target.x; this.axisY.y = this.target.y;
		}
		this.$scope.forceAttributesRefresh(this.target);
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.activate = function(_target) {

	if( _target instanceof Phaser.Group){
		this.deactivate();
		return;
	}
	if( _target === this.target)
		return;

	this.lastTarget = this.target;
	this.target = _target;

	//if there's a target
	if(this.target){
		if( this.totalDragActive ){
			this.activateTotalDrag();
		}else{
			this.deactivateTotalDrag();
		}
	}
	this.entity.visible = true;
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
		this.entity.alpha = 1;
		this.toggleAxises(false);
		this.target.go.sendMessage("activateTotalDrag")
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.deactivateTotalDrag = function() {
    this.totalDragActive = false;
    if(this.target){
		this.entity.alpha = 0.5;
		this.toggleAxises(true);
		this.target.go.sendMessage("deactivateTotalDrag")
	}
}

//=================================================================
//						DRAG
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.startDrag = function(_sender) {
	if( _sender.key == "x_move")
		this.draggerX = true;
	else
		this.draggerY = true;
}

LR.Editor.Behaviour.EntityHandle.prototype.stopDrag = function(_sender) {
	if( _sender.key == "x_move")
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