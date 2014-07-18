"use strict";

//
// This behaviour is attached to the Group that goes over the selected object.
// It is unique in the game editor.
// It contains the two axis for moving the sprite.These are created when the behaviour is instanciated
//

LR.Editor.Behaviour.EntityHandle = function(_gameobject,_$scope) {
	LR.Behaviour.call(this, _gameobject);
	this.target = null;
	//the targets moved by the handle ( these can be groups )
	this.targets = new Array();
	//this.entity.visible = false;

	this.$scope = _$scope;
	this.draggerX = false;	
	this.draggerY = false;

	//Create a group containing the selection sprite (highlights)
	this.selectSprites = this.entity.add( new LR.Entity.Group(_$scope.game,0,0) );
	for(var i= 0 ; i < 10; i ++)
		this.createSprite();
	//keep an array of references of active sprites
	this.activeSprites = new Array();
    //Create Handles ( for moving & scaling)
    this.createHandles();

    this.toggleAxises(false);

    var inputManager = this.entity.game.inputManager;
    //Full drag on CTRL
    inputManager.bindKeyPress("ctrl",this.activateTotalDrag, this );
    inputManager.bindKeyRelease("ctrl",this.deactivateTotalDrag, this );
    //Clone on C
    inputManager.bindKeyRelease("clone",this.duplicate, this );
    //Activate scale
    inputManager.bindKeyPress("scale",this.activateScale, this );
    inputManager.bindKeyRelease("scale",this.deactivateScale, this );

    this.state = "move";

    this.totalDragActive = false;
};

LR.Editor.Behaviour.EntityHandle.prototype = Object.create(LR.Behaviour);
LR.Editor.Behaviour.EntityHandle.prototype.constructor = LR.Editor.Behaviour.EntityHandle;

//===========================================================
//					UPDATES
//===========================================================

LR.Editor.Behaviour.EntityHandle.prototype.update = function() {
	LR.Behaviour.prototype.update.call(this);

	if( this.targets != null && this.targets.length > 0 ){
		switch(this.state){
			case "move" : this.updateMoveHandle();
				break;
			case "scale" : this.updateScaleHandle();
				break;
		}
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.updateMoveHandle = function(){
	//if an axis handle is being dragged
	if( this.draggerX || this.draggerY ){
		//replace the non-dragged axis 
		if( this.draggerX ){
			this.axisY.x = this.axisX.x; this.axisY.y = this.axisX.y;
		}else{
			this.axisX.x = this.axisY.x; this.axisX.y = this.axisY.y;
		}

		this.placeTargets();
	}
	//make the highlight follow the target(s)
	this.updateSpritesStick();
	//Refresh attributes ( position may change )
	this.$scope.forceAttributesRefresh(this.mainTarget);
}

LR.Editor.Behaviour.EntityHandle.prototype.updateScaleHandle = function(){
	
}

//===========================================================
//					ACTIVATION
//===========================================================

LR.Editor.Behaviour.EntityHandle.prototype.activate = function(_target) {

	this.cleanSprites();
	this.cleanTargets();

	this.mainTarget = _target;
	this.lastTarget = _target;
	
	//Display
	this.entity.visible = true;
	//Adds the new target, and its child if its a group
	this.addTarget(_target);

	//Render it
	this.updateSpritesStick();

	//check if total drag is already active
	if( this.totalDragActive ){
		this.activateTotalDrag();
	}else{
		this.deactivateTotalDrag();
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.deactivate = function() {	
	this.entity.visible = false;
	this.toggleAxises(false);
	if( this.mainTarget != null )
		this.lastTarget = this.mainTarget;
	this.mainTarget = null;
}

LR.Editor.Behaviour.EntityHandle.prototype.recoverLastTarget = function() {
	this.activate(this.lastTarget);
}

//=================================================================
//						SCALE 
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.activateScale = function(){
	this.state = "scale";
	this.toggleAxises(false);
}

LR.Editor.Behaviour.EntityHandle.prototype.deactivateScale = function(){
	this.state = "move";
	this.toggleAxises(true);
}

//=================================================================
//						ADD / REMOVE A TARGET
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.addTarget = function(_target) {
	//create target object
	var objTarget = { entity: _target , offset : new Phaser.Point() };
	this.targets.push(objTarget);
	//add highlight sprites on every object under the target
	this.addSpriteSticksRecursive(_target);
	//compute position of the axis handles
	this.computeGravityPoint();
}

LR.Editor.Behaviour.EntityHandle.prototype.addSpriteSticksRecursive = function(_entity) {
	if( _entity.type == Phaser.GROUP ){
		for(var i=0; i < _entity.children.length; i++)
			this.addSpriteSticksRecursive(_entity.children[i]);
	}else{
		var sprite = this.getSprite();
		sprite.target = _entity;
		//set the anchor
		if( _entity.anchor )
			sprite.anchor = _entity.anchor;	
		else
			sprite.anchor.setTo(0.5,0.5);	
		//keep size
		sprite.width = _entity.width;
		sprite.height = _entity.height;
		//push the new target object
		this.activeSprites.push(sprite);
	}	
}

LR.Editor.Behaviour.EntityHandle.prototype.cleanTargets = function(){
	this.targets = new Array();
}

//=================================================================
//						DUPLICATE
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.duplicate = function(_key) {
	if( this.mainTarget && _key.altKey ){
		this.$scope.$emit("cloneEntityEmit",{ entity : this.target});
	}
}

//=================================================================
//						TOTAL DRAG
//=================================================================
LR.Editor.Behaviour.EntityHandle.prototype.activateTotalDrag = function() {	
   
    if(this.targets!=null && this.targets.length > 0 && this.targets.length == 1){
    	this.totalDragActive = true;
		this.toggleAxises(false);
		for(var i=0; i < this.targets.length; i++){
			this.targets[i].entity.go.sendMessage("activateTotalDrag")
			//this.targets[i].selectSprite.alpha = 1;
		}
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.deactivateTotalDrag = function() {
    this.totalDragActive = false;
    if(this.targets != null && this.targets.length > 0){
		this.toggleAxises(true);
		for(var i=0; i < this.targets.length; i++){
			this.targets[i].entity.go.sendMessage("deactivateTotalDrag")
			//this.targets[i].selectSprite.alpha = 0.5;
		}

		this.computeGravityPoint();
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

//=================================================================
//						TARGETS
//=================================================================

// This will place the targetted object at its right place, according to the handle position
LR.Editor.Behaviour.EntityHandle.prototype.placeTargets = function(){
	for(var i=0; i < this.targets.length; i++){
		var target = this.targets[i];
		this.placeTarget(target.entity,target.selectSprite,target.offset);
	}
}

// This will place the targetted object at its right place, according to the handle position
LR.Editor.Behaviour.EntityHandle.prototype.placeTarget = function(_target,_selectSprite,_offset){
	if( _offset == null )
		_offset = new Phaser.Point();

	//place Target with its offset
	_target.go.setPosition(this.axisX.x + _offset.x ,
								this.axisX.y + _offset.y );
}

//=================================================================
//						GRAVITY POINT
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.computeGravityPoint = function(){	
	var point = new Phaser.Point();
	for(var i=0; i < this.targets.length; i++){
		var target = this.targets[i];
		point.x = target.entity.x;
		point.y = target.entity.y;
	}
	point.x /= this.targets.length;
	point.y /= this.targets.length;

	//Replace the handles at the gravity point
	this.axisX.x = point.x; this.axisX.y = point.y;
	this.axisY.x = point.x; this.axisY.y = point.y;

	//Recompute new Offsets
	for(var i=0; i < this.targets.length; i++){
		var target = this.targets[i];
		target.offset.x = target.entity.x - this.axisX.x;
		target.offset.y = target.entity.y - this.axisX.y;
	}

}

//=================================================================
//						SPRITES
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.createSprite = function(){	
	var sprite = this.entity.add( new LR.Entity.Sprite(this.entity.game,0,0,"__select") );
	sprite.anchor.setTo(0.5,0.5);
	sprite.kill();
	this.selectSprites.add(sprite);
	return sprite;
}

//Get an unused sprite, or create one if none is available
LR.Editor.Behaviour.EntityHandle.prototype.getSprite = function(){	
	var sprite = this.selectSprites.getFirstDead();
	if( sprite == null)
		sprite = this.createSprite();
	else
		sprite.revive();
	return sprite;
}

LR.Editor.Behaviour.EntityHandle.prototype.updateSpritesStick = function(){
	for(var i=0; i < this.activeSprites.length; i++){
		var sprite = this.activeSprites[i];
		sprite.x = sprite.target.world.x;
		sprite.y = sprite.target.world.y;
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.cleanSprites = function(){
	for(var i=0; i < this.activeSprites.length; i++){
		var sprite = this.activeSprites[i];
		sprite.kill();
	}
	this.activeSprites = new Array();
}

//=================================================================
//						UTILS
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.createHandles = function(){
	//========= MOVING HANDLES ===================
    this.axisX = this.entity.add(new LR.Entity.Sprite(this.$scope.game,0,0,"__x_move"));
    this.axisX.anchor.setTo(0,0.5);
    this.axisX.name = "__xAxis";
    //AXIS X Input
    this.activateInputOnEntity(this.axisX);
    this.axisX.input.allowVerticalDrag = false;

    this.axisY = this.entity.add(new LR.Entity.Sprite(this.$scope.game,0,0,"__y_move"));
    this.axisY.anchor.setTo(0.5,1);
    this.axisY.name = "__yAxis";
    //AXIS X Input
    this.activateInputOnEntity(this.axisY);
    this.axisY.input.allowHorizontalDrag = false;
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