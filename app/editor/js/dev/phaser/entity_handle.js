"use strict";

//
// This behaviour is attached to the Group that goes over the selected object.
// It is unique in the game editor.
// It contains the two axis for moving the sprite.These are created when the behaviour is instanciated
//

LR.Editor.Behaviour.EntityHandle = function(_gameobject,_$scope) {
	LR.Behaviour.call(this, _gameobject);
	this.$scope = _$scope;

	this.target = null;
	//the targets moved by the handle ( these can be groups )
	this.targets = new Array();
	//this.entity.visible = false;

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

    var inputManager = this.entity.game.inputManager;
    //Full drag on CTRL
    inputManager.bindKeyPress("ctrl",this.activateTotalDrag, this );
    inputManager.bindKeyRelease("ctrl",this.deactivateTotalDrag, this );
    //Clone on C
    inputManager.bindKeyRelease("clone",this.duplicate, this );
    //Delete
    inputManager.bindKeyRelease("del",this.deleteTargets, this );
    //Activate scale
    inputManager.bindKeyPress("scale",this.activateScale, this );
    inputManager.bindKeyRelease("scale",this.deactivateScale, this );
    //Activate rotate
    inputManager.bindKeyPress("rotate",this.activateRotate, this );
    inputManager.bindKeyRelease("rotate",this.deactivateRotate, this );

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
			case "rotate" : this.updateRotateHandle();
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
		//make the highlight follow the target(s)
		this.updateSpritesStick();
		//Refresh attributes ( position may change )
		this.$scope.forceAttributesRefresh(this.mainTarget);
	}else{
		this.computeGravityPoint();
		//make the highlight follow the target(s)
		this.updateSpritesStick();
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.updateScaleHandle = function(){
	if( this.draggerX ){
		//distance between the scaler handle and the object position
		var delta = this.scalerX.x - this.mainTarget.world.x;
		//distance between the anchor position of the object and the right edge
		var dEdge = (this.mainTarget.width * (1 -this.mainTarget.anchor.x ));
		var w = this.mainTarget.width + ( ( delta - dEdge ) * this.mainTarget.anchor.x ) ;
		var deltaWidth = w - this.mainTarget.width;
		this.mainTarget.width = w;
		this.resizeShapes(deltaWidth,0);
	}else if( this.draggerY) {
		//distance between the scaler handle and the object position
		var delta = this.mainTarget.world.y - this.scalerY.y;
		//distance between the anchor position of the object and the right edge
		var dEdge = (this.mainTarget.height * (1 -this.mainTarget.anchor.y ));
		var h = this.mainTarget.height + ( ( delta - dEdge ) * this.mainTarget.anchor.y ) ;
		var deltaHeight = h - this.mainTarget.height;
		this.mainTarget.height = h;
		this.resizeShapes(0,deltaHeight);
	}
	//when dragged, refresh attributes
	if( this.draggerX || this.draggerY ){
		this.updateSpritesStick();
		//Refresh attributes ( position may change )
		this.$scope.forceAttributesRefresh(this.mainTarget);
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.updateRotateHandle = function(){
	if( this.rotater.input.isDragged ){
		var pos = new Phaser.Point(this.mainTarget.world.x, this.mainTarget.world.y);
		var dir = Phaser.Point.subtract( pos,this.rotater.position );
		var angle = dir.normalize().angle(new Phaser.Point(),true);
		this.mainTarget.angle = angle;
		if( this.mainTarget.body ){
			this.mainTarget.body.angle = angle;
		}
		this.updateSpritesStick();
		//Refresh attributes ( position may change )
		this.$scope.forceAttributesRefresh(this.mainTarget);
	}
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

LR.Editor.Behaviour.EntityHandle.prototype.deactivateEntity = function(_entity) {	
	if( this.mainTarget === _entity ){
		this.deactivate();
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
//						ADD / REMOVE A TARGET
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.addTarget = function(_target) {
	//Check if target is not already added
	if( this.isTargetSelected(_target) ){
		//if it's already selected, remove it from the targets
		this.removeTarget(_target);
		return;
	}
	//Do total activation if no targets
	if( this.targets.length == 0){
		this.mainTarget = _target;
		this.lastTarget = _target;
		this.entity.visible = true;
		this.deactivateTotalDrag();
	}
	//create target object
	var objTarget = { entity: _target , offset : new Phaser.Point() };
	this.targets.push(objTarget);
	//add highlight sprites on every object under the target
	this.addSpriteSticksRecursive(_target);
	//compute position of the axis handles
	this.computeGravityPoint();
	this.updateSpritesStick();
}

//Removes a target a clean its stick sprites
LR.Editor.Behaviour.EntityHandle.prototype.removeTarget = function(_target){
	for(var i=0; i < this.targets.length; i++){
		var isMain = false;
		//Get target and removes its
		if( this.targets[i].entity === _target ){
			var targetData = this.targets[i];
			isMain = targetData.entity === this.mainTarget;
			//remove
			this.removeSpriteSticksRecursive(_target);
			this.targets.splice(i,1);
		}
		//if the removed target was the main one
		if( isMain ){
			//take another target ( if any )
			if( this.targets.length > 0)
				this.mainTarget = this.targets[0].entity;
			//or deactivate all ( if no other target )
			else
				this.deactivate();
		}
	}
	this.updateSpritesStick();
	this.computeGravityPoint();
}

LR.Editor.Behaviour.EntityHandle.prototype.cleanTargets = function(){
	this.targets = new Array();
}

//Returns true if the target is already selected by the handle
LR.Editor.Behaviour.EntityHandle.prototype.isTargetSelected = function(_target){
	for(var i=0; i < this.targets.length; i++){
		if( this.targets[i].entity === _target ){
			return true;
		}
	}
	return false;
}

//Returns the target DATA of the entity if it is a direct target ( not a child of a target )
LR.Editor.Behaviour.EntityHandle.prototype.getTargetByEntity = function(_entity){
	for(var i=0; i < this.targets.length; i++){
		if( this.targets[i].entity === _entity ){
			return this.targets[i];
		}
	}
	return null;
}

//===================== SPRITESS STICKS ==============================

// Recursively add a stick to the entity and its children
// A stick is the yellow rectangle used for selection
LR.Editor.Behaviour.EntityHandle.prototype.addSpriteSticksRecursive = function(_entity) {
	if( _entity.type == Phaser.GROUP ){
		for(var i=0; i < _entity.children.length; i++)
			this.addSpriteSticksRecursive(_entity.children[i]);
	}else{
		var sprite = this.getSprite();
		sprite.target = _entity;
		_entity.ed_spriteStick = sprite;
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

// Recursively removes the sticks affected to the entity and its children
// A stick is the yellow rectangle used for selection
LR.Editor.Behaviour.EntityHandle.prototype.removeSpriteSticksRecursive = function(_entity) {
	if( _entity.type == Phaser.GROUP ){
		for(var i=0; i < _entity.children.length; i++)
			this.removeSpriteSticksRecursive(_entity.children[i]);
	}else{
		var index = this.activeSprites.indexOf(_entity.ed_spriteStick);
		if( index >= 0){
			var stick = this.activeSprites[index];
			stick.target = null;
			stick.kill();
			this.activeSprites.splice(index, 1);
		}
	}	
}
//=================================================================
//						SCALE 
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.activateScale = function(){
	if(this.mainTarget == null || this.mainTarget.type == Phaser.GROUP || this.targets.length > 1)
		return;
	this.state = "scale";
	this.toggleAxises(false);
	this.toggleScalers(true);
	//Placer Scaler X 
	this.scalerX.x = this.mainTarget.world.x + this.mainTarget.width * ( 1 - this.mainTarget.anchor.x );
	this.scalerX.y = this.mainTarget.world.y ;//+ this.mainTarget.height * ( 0.5 );
	//Placer Scaler Y 
	this.scalerY.x = this.mainTarget.world.x;
	this.scalerY.y = this.mainTarget.world.y - this.mainTarget.height * this.mainTarget.anchor.y ;
}

LR.Editor.Behaviour.EntityHandle.prototype.deactivateScale = function(){
	if( this.mainTarget == null )
		return;
	this.state = "move";
	this.toggleAxises(true);
	this.toggleScalers(false);
}

//=================================================================
//						ROTATE 
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.activateRotate = function(){
	if( this.mainTarget == null )
		return;
	this.state = "rotate";
	this.rotater.visible = true;
	//we need a position to display the rotater handle. We'll take the higher size prop
	var distance = this.mainTarget.width;
	if( this.mainTarget.height > distance )
		distance = this.mainTarget.height;
	distance *= 0.55;
	//compute the vector to add to the world's sprite position
	var normRotated = LR.Utils.rotatePoint(null,this.mainTarget.angle).normalize();
	normRotated = normRotated.setMagnitude(distance);
	var rotatedPoint = this.mainTarget.go.world.add(normRotated.x,normRotated.y);
	this.rotater.x = rotatedPoint.x; this.rotater.y = rotatedPoint.y;
	this.toggleAxises(false);
}

LR.Editor.Behaviour.EntityHandle.prototype.deactivateRotate = function(){
	if( this.mainTarget == null )
		return;
	this.state = "move";
	this.toggleAxises(true);
	this.rotater.visible = false;
}


//=================================================================
//						DUPLICATE / DELETE
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.duplicate = function(_key) {
	if( this.mainTarget && _key.altKey ){
		this.$scope.$emit("cloneEntityEmit",
							{ entity : this.mainTarget,
							position : { x : this.entity.game.input.activePointer.worldX ,
										 y : this.entity.game.input.activePointer.worldY
										}
						 	}
						 );
	}
}

//DELETES the target from the world. 
LR.Editor.Behaviour.EntityHandle.prototype.deleteTargets = function(_key){
	if( this.mainTarget && _key.altKey ){
		for(var i=0; i < this.targets.length; i++){
			this.$scope.$emit("deleteEntityEmit", {entity: this.targets[i].entity});
		}
		this.targets = new Array();
	}
}

//=================================================================
//						TOTAL DRAG
//=================================================================
LR.Editor.Behaviour.EntityHandle.prototype.activateTotalDrag = function() {	
   
    if(this.targets!=null && this.targets.length > 0 && this.targets.length == 1){
    	this.totalDragActive = true;
    	this.toggleScalers(false);
		this.toggleAxises(false);
		for(var i=0; i < this.targets.length; i++){
			this.targets[i].entity.go.sendMessage("activateTotalDrag")
			//this.targets[i].selectSprite.alpha = 1;
		}
	}
}

LR.Editor.Behaviour.EntityHandle.prototype.deactivateTotalDrag = function() {
    this.totalDragActive = false;
    switch(this.state){
		case "move" : this.toggleAxises(true);
			break;
		case "scale" : this.toggleScalers(true);
			break;
	}
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
//						DRAG of the HANDLES
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
//						OVER HANDLES
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.inputOver = function(_sender,_pointer) {
	_sender.alpha = 1;
}

LR.Editor.Behaviour.EntityHandle.prototype.inputOut = function(_sender,_pointer) {
	_sender.alpha = 0.7;
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
//@param {LR.Entity} _target
LR.Editor.Behaviour.EntityHandle.prototype.placeTarget = function(_target,_selectSprite,_offset){
	if( _offset == null )
		_offset = new Phaser.Point();

	if( _target.ed_fixedToCamera){
		//change cameraoffset, not position
		//for that we need to compute the position of the handle from the 
		//camera debug object point of view 
		var rectObject = this.$scope.game.camera.ed_debugObject;
        _target.cameraOffset.x = this.axisX.x - rectObject.graphicsData[0].points[0];
        _target.cameraOffset.y = this.axisX.y - rectObject.graphicsData[0].points[1];
	}else{		
		var localX = this.axisX.world.x;
		var localY = this.axisX.world.y;
		if( _target.parent.world){
			localX -= _target.parent.world.x;
			localY -= _target.parent.world.y;
		}
		//place Target with its offset
		_target.go.setPosition(localX + _offset.x ,
								localY + _offset.y );
	}

}

//=================================================================
//						GRAVITY POINT
//=================================================================

LR.Editor.Behaviour.EntityHandle.prototype.computeGravityPoint = function(){
	if(this.targets.length == 0 ){
		this.deactivate();
		return;
	}	
	var point = new Phaser.Point();
	for(var i=0; i < this.targets.length; i++){
		var target = this.targets[i];
		point.x = target.entity.world.x;
		point.y = target.entity.world.y;
	}
	point.x /= this.targets.length;
	point.y /= this.targets.length;

	//Replace the handles at the gravity point
	this.axisX.x = point.x; this.axisX.y = point.y;
	this.axisY.x = point.x; this.axisY.y = point.y;

	//Recompute new Offsets
	for(var i=0; i < this.targets.length; i++){
		var target = this.targets[i];
		target.offset.x = target.entity.world.x - this.axisX.x;
		target.offset.y = target.entity.world.y - this.axisX.y;
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
		sprite.width = sprite.target.width;
		sprite.height = sprite.target.height;
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

	//========= MOVING HANDLES ===================
	this.scalerX = this.entity.add(new LR.Entity.Sprite(this.$scope.game,0,0,"__x_move"));
    this.scalerX.anchor.setTo(0,0.5);
    this.scalerX.scale = new Phaser.Point(0.2,2);
    this.scalerX.name = "__xScaler";
    //AXIS X Input
    this.activateInputOnEntity(this.scalerX);
    this.scalerX.input.allowVerticalDrag = false;

    this.scalerY = this.entity.add(new LR.Entity.Sprite(this.$scope.game,0,0,"__y_move"));
    this.scalerY.anchor.setTo(0.5,1);
    this.scalerY.scale = new Phaser.Point(2,0.2);
    this.scalerY.name = "__yScaler";
    //AXIS X Input
    this.activateInputOnEntity(this.scalerY);
    this.scalerY.input.allowHorizontalDrag = false;  

    this.rotater = this.entity.add(new LR.Entity.Sprite(this.$scope.game,0,0,"__y_move"));
    this.rotater.anchor.setTo(0.45,1);
    this.rotater.angle = 45;
    this.rotater.scale = new Phaser.Point(2,0.2);
    this.rotater.name = "__rotater";
    this.activateInputOnEntity(this.rotater);

    this.toggleAxises(false);
    this.toggleScalers(false);
	this.rotater.visible = false;
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


LR.Editor.Behaviour.EntityHandle.prototype.toggleAxises = function(_visible){
	this.axisY.visible = _visible;
	this.axisX.visible = _visible;
}


LR.Editor.Behaviour.EntityHandle.prototype.toggleScalers = function(_visible){
	this.scalerX.visible = _visible;
	this.scalerY.visible = _visible;
}

LR.Editor.Behaviour.EntityHandle.prototype.resizeShapes = function(_deltaW,_deltaH){
	for(var i=0; i < this.mainTarget.go.getShapesCount(); i++)
		this.resizeShape(i,_deltaW,_deltaH);
}

LR.Editor.Behaviour.EntityHandle.prototype.resizeShape = function(_i,_deltaW,_deltaH){
	if( this.mainTarget.body == null || this.mainTarget.key != "none"){
		return;
	}
	//keep sensor value
	var formerEdSensor = this.mainTarget.go.getShape(_i).ed_sensor;
	//get data object of the shape
	var dataShape = this.mainTarget.go.getShapeData(_i);
	dataShape.width += _deltaW;
	dataShape.height += _deltaH;
	if( dataShape.width < 0 || dataShape.height < 0){
		return;
	}
	//Resize shape with modified data
	var shape = this.mainTarget.go.replaceShapeByRectangle(_i, dataShape )		
	shape.sensor = true;
	shape.ed_sensor = formerEdSensor;

}