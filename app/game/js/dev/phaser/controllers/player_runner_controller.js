"use strict";
/**
* Controller to make the player run
*
* @namespace Behaviour
* @class class_name
* @constructor
* @param {param_type} param_description
*/
LR.Loopy.Behaviour.PlayerRunnerController = function(_gameobject){	
	LR.Behaviour.call(this,_gameobject);

	this.mainShape = this.entity.body.data.shapes[0];
	this.feetSensor = this.go.getShapeByName("feet");
	this.rightSensor = this.go.getShapeByName("right");
	this.leftSensor = this.go.getShapeByName("left");
	//this.createSensors();

	this.entity.body.setZeroVelocity();

	//  Modify a few body properties
	this.entity.body.setZeroDamping();
	this.entity.body.fixedRotation = true;

	this.entity.anchor.setTo(0.5,0.5);

	//StateEnum
	this.StateEnum = { IDLE:"idle", RUNNING :"running", JUMPING:"jumping", 
						ATTACKING : "attacking", SLIDING_WALL :"sliding_wall",
						HIT : "hit" , DIYING : "diying", 
						WIN : "win", PAUSED : "paused" };
	//State
	this.state = this.StateEnum.IDLE;
	this.lastState = this.StateEnum.IDLE;
	//Obvious
	this.onGround = false;
	//the player can be touching a wall, but not sliding on it
	this.touchingWall = false;

	this.jumpForce = 400;
	this.speedRun = 150;
	this.direction = Global.TO_RIGHT;
	//true when the player is hit, or on invincibilty after hit
	this.isHit = false;

	//binds to the input manager
	this.go.game.inputManager.bindKeyPress("valid",this.attack,this);
	this.go.game.inputManager.bindMousePress(this.jump,this);

	//postBroadphase
	this.go.setPostBroadPhaseCallback(this.onPostBroadphase,this);

	//ANIMATIONS
	this.runAnim = this.entity.animations.add('run',[ 0, 1, 2, 1 ]);
    this.jumpAnim = this.entity.animations.add("jump", [ 6 ]);    
    this.attackAnim = this.entity.animations.add("attack", [ 4, 5 ]);    
    this.wallGripAnim = this.entity.animations.add("wall_grip", [ 8, 9, 10 ]);

    this.run();

	this.entity.game.camera.bounds = null;
	this.entity.game.camera.follow(this.entity,Phaser.Camera.FOLLOW_PLATFORMER);
};


LR.Loopy.Behaviour.PlayerRunnerController.prototype = Object.create(LR.Behaviour.prototype);
LR.Loopy.Behaviour.PlayerRunnerController.prototype.constructor = LR.Loopy.Behaviour.PlayerRunnerController;

LR.Loopy.Behaviour.PlayerRunnerController.prototype.create = function(_data){
	if( _data.weapon ){
		var weaponGO = this.entity.game.state.getCurrentState().findGameObjectByName(_data.weapon);
		if( weaponGO ) this.weapon = weaponGO.getBehaviour(LR.Loopy.Behaviour.Weapon);
	}
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.update = function(){
	
	switch(this.state){
		case this.StateEnum.RUNNING : this.applyRunSpeed(); break;
		case this.StateEnum.ATTACKING : this.applyRunSpeed(); break;
		//case this.StateEnum.JUMPING : this.applyRunSpeed(); break;
	}
}

//=================================================================
// 						BEGIN CUTSCENE
//=================================================================

LR.Loopy.Behaviour.PlayerRunnerController.prototype.onBeginCutscene = function(){
	this.changeState( this.StateEnum.PAUSED );
	this.go.body.velocity.x = 0;
	this.onCutscene = true;
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.onEndCutscene = function(){
	this.onCutscene = false;
	this.run();
}

//=================================================================
// 						CALLBACK FROM COLLISIONs
//=================================================================

LR.Loopy.Behaviour.PlayerRunnerController.prototype.onPostBroadphase = function(_otherBody){
	
	return true;
}

//Process the shape origin of the signal and call specific methods
LR.Loopy.Behaviour.PlayerRunnerController.prototype.onBeginContact = function(_otherBody, _myShape, _otherShape, _equation){
	//if from feet
	if( _myShape == this.feetSensor ){
		this.onBeginFeetContact(_otherBody,_otherShape,_equation);
	//if from sides
	}else if( _myShape == this.rightSensor || _myShape == this.leftSensor ){
		this.onBeginSideContact(_otherBody, _myShape, _otherShape, _equation)
	}
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.onContact = function(_otherBody){
	
}

//Process the shape origin of the signal and call specific methods
LR.Loopy.Behaviour.PlayerRunnerController.prototype.onEndContact = function(_otherBody, _myShape, _otherShape){
	if( _myShape == this.feetSensor ){
		this.onEndFeetContact(_otherBody,_otherShape);
	}else if( _myShape == this.rightSensor || _myShape == this.leftSensor ){
		this.onEndSideContact(_otherBody, _myShape, _otherShape)
	}
}

//=================================================================
// 						FEET COLLISION
//=================================================================
LR.Loopy.Behaviour.PlayerRunnerController.prototype.onBeginFeetContact = function(_otherBody, _otherShape, _equation){
	if( _otherBody.go.layer == "ground" && this.go.body.velocity.y < 0 ){
		this.onGround = true;	
		this.run();
	}
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.onEndFeetContact = function(_otherBody, _otherShape){
	this.onGround = false;
}

//=================================================================
// 						SIDE COLLISION
//=================================================================
LR.Loopy.Behaviour.PlayerRunnerController.prototype.onBeginSideContact = function(_otherBody,_myShape, _otherShape, _equation){
	if( _otherBody.go.layer == "ground"){
		//check if the player collides by facing the wall
		if( this.direction > 0 && _myShape==this.rightSensor || this.direction < 0 && _myShape == this.leftSensor ){
			this.facingWall = true;
			if( this.onGround == false ){
				this.changeState(this.StateEnum.SLIDING_WALL);
				this.entity.animations.play('wall_grip', 8, false);
			}
			//console.log("facingWall");
		}
	}
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.onEndSideContact = function(_otherBody, _myShape, _otherShape){
	if( _otherBody.go.layer == "ground")
		this.facingWall = false;
}

//=================================================================
// 						JUMPING
//=================================================================

LR.Loopy.Behaviour.PlayerRunnerController.prototype.jump = function(){
	//check if wall jumping is possible
	if( this.state == this.StateEnum.SLIDING_WALL || ( this.facingWall && !this.onGround )){
		this.wallJump();
		return
	}
	//check classical jumping
	if( this.state != this.StateEnum.JUMPING ){
		if(this.onGround){
			this.changeState(this.StateEnum.JUMPING);
			this.onGround = false;
			this.applyJumpSpeed();
		}
	}
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.wallJump = function(){
	this.facingWall = false;
	this.changeDirection();
	this.changeState(this.StateEnum.JUMPING);
	this.applyJumpSpeed();
	this.applyRunSpeed();
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.applyJumpSpeed = function(){
	this.entity.animations.play('jump', 5, true);
	this.entity.body.velocity.y = -this.jumpForce;
}

//=================================================================
// 						RUNNING
//=================================================================

LR.Loopy.Behaviour.PlayerRunnerController.prototype.run = function(){
	this.changeState( this.StateEnum.RUNNING );
	this.applyRunSpeed();
	this.entity.animations.play('run', 5, true);
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.running = function(){
	this.applyRunSpeed();
}

/*
* Make the Player change direction.
* @method changeDirection
*/
LR.Loopy.Behaviour.PlayerRunnerController.prototype.changeDirection = function(_data){

	if( _data == null ){
		this.direction *= -1;
	}else{
		//a trigger can send data to change the player direction
		if( _data.direction != null )
			this.direction = _data.direction;
	}
	// flip sprite
	this.entity.scale.x = this.direction;
}

/**
* Gives the GameObject the velocity on X accordtin to current speed and direction
*
* @method applyRunSpeed
*/
LR.Loopy.Behaviour.PlayerRunnerController.prototype.applyRunSpeed = function(){
	this.entity.body.velocity.x = this.speedRun * this.direction;
}

//=================================================================
// 						ATTACK
//=================================================================
LR.Loopy.Behaviour.PlayerRunnerController.prototype.attack = function(){
	if( this.weapon ){
		this.weapon.attack();
		this.entity.animations.play('attack', 10, false);
	}
}

//Callback sent from the weapon
LR.Loopy.Behaviour.PlayerRunnerController.prototype.endAttack = function(_data){
	this.run();
}

//=================================================================
// 						DIE
//=================================================================
LR.Loopy.Behaviour.PlayerRunnerController.prototype.die = function(_data){
	console.log(_data.typeDeath);
	this.go.game.state.start("Loading");
}

//=================================================================
// 						HIT
//=================================================================

LR.Loopy.Behaviour.PlayerRunnerController.prototype.hit = function(_data){
	if( this.isHit )
		return;
	//only the main shape can be "hit"
	if( _data.collShape != this.mainShape){
		return;
	}
	
	this.state = this.StateEnum.HIT;
	console.log(_data.typeHit);
	if( _data.typeHit == "enemy"){
		this.isHit = true;
	}
	this.entity.body.velocity.y -= 170;
	this.entity.body.velocity.x -= 200;

	//creates a twinkle tween
	this.tweenHit = this.entity.game.add.tween(this.entity);
	this.tweenHit.to( { alpha: 0 }, 200, Phaser.Easing.Linear.None, false, 0, 4, true);
	//the onLoopHit function will wait for the end of the tween
	this.tweenHit.onLoop.add(this.onLoopHit,this);
	this.tweenHit.start();
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.onLoopHit = function(){
	// Tween._repeat decrease when an loop ends, so we wait for this value to reach 0
	if(this.tweenHit._repeat <= 0){
		this.tweenHit.stop();
		this.endHit();
	}
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.endHit = function(){
	this.entity.alpha = 1;
	this.isHit = false;
}

//=================================================================
// 						WIN
//=================================================================

LR.Loopy.Behaviour.PlayerRunnerController.prototype.win = function(_data){
	this.state = this.StateEnum.WIN;
	this.entity.game.state.start("SelectionMenu");
}

//=================================================================
//							MISC
//=================================================================

LR.Loopy.Behaviour.PlayerRunnerController.prototype.changeState = function(_state){
	if( this.onCutscene )
		return;
	this.lastState = this.state;
	this.state = _state;
}

LR.Loopy.Behaviour.PlayerRunnerController.prototype.isMainShape = function(_shape){
	if( this.mainShape == _shape )
		return true;
	return false;
}

//=================================================================
// 						CREATING SENSORS
//=================================================================
LR.Loopy.Behaviour.PlayerRunnerController.prototype.createSensors = function(){
	//RIGHT SENSOR
	//								   w  h  offX offY rot
	this.rightSensor = this.entity.body.addRectangle(20, 50, 20, 0, 0)
	this.rightSensor.sensor = true;
	//LEFT SENSOR
	this.leftSensor = this.entity.body.addRectangle(20, 50, -20, 0, 0)
	this.leftSensor.sensor = true;	
	//FEET SENSOR
	this.feetSensor = this.entity.body.addRectangle(30, 20, 0, 30, 0)
	this.feetSensor.sensor = true;
}