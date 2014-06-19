"use strict";

//
// This behaviour is attached to every sprite in the editor. It handles dragging
//

LR.Editor.Behaviour.EntityInputHandler = function(_gameobject,_$scope) {
	LR.Behaviour.call(this, _gameobject);
	this.$scope = _$scope;
	//enable dragging
	this.entity.inputEnabled = true;
	this.entity.input.enableDrag();
	this.entity.input.useHandCursor = true;
	this.entity.input.draggable = false;
	this.lastPriorityID = 0;

	this.entity.events.onDragStart.add(this.startDrag, this);
    this.entity.events.onDragStop.add(this.stopDrag, this);

    this.entity.events.onInputDown.add(this.onInputDown, this);

    //the offset of the drag pointer from the center of the sprite's body
    this.pointerOffset = new Phaser.Point();
    this.locked = false;
};

LR.Editor.Behaviour.EntityInputHandler.prototype = Object.create(LR.Behaviour);
LR.Editor.Behaviour.EntityInputHandler.prototype.constructor = LR.Editor.Behaviour.EntityInputHandler;

/*
* Update the handle according to the gameobject position
*/
LR.Editor.Behaviour.EntityInputHandler.prototype.update = function() {
	//move the body a la mano if the sprite is dragged ( dragging doesn't work with bodies)
	if( this.entity.input.isDragged ){
		this.checkDrag();
		//BODY => follow pointer
		if( this.entity.body != null ){
			this.entity.body.x = this.entity.game.input.activePointer.worldX + this.pointerOffset.x;
			this.entity.body.y = this.entity.game.input.activePointer.worldY + this.pointerOffset.y;
		}
		this.$scope.forceAttributesRefresh(this.entity,false);
	}
}

LR.Editor.Behaviour.EntityInputHandler.prototype.lock = function() {
	this.locked = true;
	if (this.entity.input){
		this.entity.input.enabled = false;
	}
}

LR.Editor.Behaviour.EntityInputHandler.prototype.unlock = function() {
	this.locked = false;
	if (this.entity.input){
		this.entity.input.enabled = true;
	}
}

//=========================================================================
//							DRAG
//=========================================================================

LR.Editor.Behaviour.EntityInputHandler.prototype.activateTotalDrag = function(){
	this.lastPriorityID = this.entity.input.priorityID;
	this.entity.input.enableDrag();
	this.entity.input.priorityID = 9000;
}

LR.Editor.Behaviour.EntityInputHandler.prototype.deactivateTotalDrag = function(){
	this.entity.input.disableDrag();	
	this.entity.input.priorityID = this.lastPriorityID;
}

LR.Editor.Behaviour.EntityInputHandler.prototype.startDrag = function() {
	
}

LR.Editor.Behaviour.EntityInputHandler.prototype.stopDrag = function() {
	this.pointerOffset = new Phaser.Point();
}

LR.Editor.Behaviour.EntityInputHandler.prototype.checkDrag = function() {
	if( this.entity.game.input.activePointer.withinGame == false && this.entity.input.draggable ){
		//this.deactivateTotalDrag();
	}
}

LR.Editor.Behaviour.EntityInputHandler.prototype.onInputDown = function() {
	if( this.locked )
		return;
	this.$scope.$emit("selectEntityEmit", {entity : this.entity});
	if( this.go )
		this.go.sendMessage("onSelected");
	if( this.entity.body ){
		this.pointerOffset.x = this.entity.body.x - this.entity.game.input.activePointer.worldX ;
		this.pointerOffset.y = this.entity.body.y - this.entity.game.input.activePointer.worldY ;
	}
}