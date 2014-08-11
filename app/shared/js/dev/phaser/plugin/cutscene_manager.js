"use strict";

/**
* Start Manage cutscenes.
*
* @class CutsceneManager
* @constructor
* @param {Phaser.Game} game
*/
Phaser.Plugin.CutsceneManager = function( _game, _parent ){
	this.game = _game;

	this.state = "IDLE";

	this.cutscene = null;
	this.currentIndex = 0;

	this.actionsFinished = 0;
	this.actionsForEvent = 0;

	if (Phaser.Plugin.CutsceneManager.INSTANCE == null) {
		Phaser.Plugin.call(this, _game, _parent);

		Phaser.Plugin.CutsceneManager.INSTANCE = this;
		_game.cutsceneManager = Phaser.Plugin.CutsceneManager.INSTANCE;
	}

	return Phaser.Plugin.CutsceneManager.INSTANCE;
}


Phaser.Plugin.CutsceneManager.prototype = Object.create(Phaser.Plugin);
Phaser.Plugin.CutsceneManager.prototype.constructor = Phaser.Plugin.CutsceneManager;

Phaser.Plugin.CutsceneManager.prototype.update = function(){
	switch( this.state ){
		case "IDLE" : 
			break;
		case "STARTED" : this.cutsceneUpdate();
			break;
 	}
}

Phaser.Plugin.CutsceneManager.prototype.cutsceneUpdate = function(){
	
}

Phaser.Plugin.CutsceneManager.prototype.loadCutscenes = function(_cutscenes){
	this.cutscenes = _cutscenes;
}

Phaser.Plugin.CutsceneManager.prototype.start = function(_cutscene){
	this.cutscene = null;
	//CUTSCENE LOADING
	for(var i=0; i < this.cutscenes.length ; i++){	
		if( this.cutscenes[i].name == _cutscene)	{
			this.cutscene = this.cutscenes[i];
			break;
		}
	}
	if( this.cutscene == null ){
		this.state = "IDLE";
		return;
	}

	this.cameraData = { lastX : this.game.camera.x, lastY : this.game.camera.y,
						lastTarget : this.game.camera.target};

	this.state = "ACTIVE";

	this.game.state.getCurrentState().onBeginCutscene();

	this.currentIndex = -1;
	this.advance();
}

Phaser.Plugin.CutsceneManager.prototype.end = function(){
	console.log("END");
	this.state = "IDLE";
	this.game.state.getCurrentState().onEndCutscene();
}


Phaser.Plugin.CutsceneManager.prototype.advance = function(){
	//console.log("advance");
	this.currentIndex ++;
	if( this.currentIndex >= this.cutscene.events.length ){
		this.end();
		return;
	}

	var curEvent = this.cutscene.events[ this.currentIndex ];
	//reset count
	this.actionsFinished = 0;
	this.actionsForEvent = curEvent.actions.length;
	//launch actions
	for(var i=0; i < curEvent.actions.length; i++){
		var curAction = curEvent.actions[i];
		//wait 
		if( curAction.type == "wait"){
			this.state = "WAITING";
			//default
			if( curAction.data.time == null )
				curAction.data.time = 1;
			this.game.time.events.add(Phaser.Timer.SECOND * curAction.data.time, this.onActionFinished, this);
		//"other" calls an internal CutsceneManager function
		}else if( curAction.type == "other"){
			var callActionFinish = this[curAction.target](curAction.data);
			if( callActionFinish )
				this.onActionFinished();
		}else if( curAction.type == "dialog" ){
			this.game.dialogManager.activate(curAction.data.text,this.onActionFinished,this);
		}else{
			this.state = "ACTIVE";
			//find gameobject target
			var go = this.game.state.getCurrentState().findGameObjectByName(curAction.target);
			if( go ){
				switch(curAction.type){
					case "tween" : this.processTween(curAction,go.entity);
						break;
					case "function" : this.callFunction(curAction, go);
						break;
					case "set" : this.setValues(curAction, go);
						break;
				}
			}else{
				//if no target is set, then finish the action
				this.onActionFinished();
			}			
		}
	}
}

/**
* Called when an action of the current event has finished
*/
Phaser.Plugin.CutsceneManager.prototype.onActionFinished = function(){
	this.actionsFinished ++;
	if( this.actionsFinished >= this.actionsForEvent){
		this.advance();
	}
}

//===========================================================
//				SET PROCESS
//===========================================================

Phaser.Plugin.CutsceneManager.prototype.setValues = function(_currentAction,_target){
	var actionData = _currentAction.data;

	//we are prepared to act on several properties, so we may need to add action internaly
	//we have to substract one action so that we don't end up with to many afterwards
	this.actionsForEvent --;

	for(var key in actionData.properties){
		this.actionsForEvent ++;
		//parse the key and find the property on which the tween will act
		var parsedProp = getPropertyTargetByString(_target.entity,key);

		//process relativeness (?). If a tween is marked as relative, the movement on x & y will be computed from the gameobject's current position
		if( actionData.relative != null && actionData.relative == true ){
			if( parsedProp.property == "x") actionData.properties[key] += parsedProp.targetObject[parsedProp.property];
			if( parsedProp.property == "y") actionData.properties[key] += parsedProp.targetObject[parsedProp.property];
		}
		//console.log( parsedProp.property );
		//if there is a delay before calling the function 
		if( actionData.delay != null && actionData.delay > 0){

			// function to call at the end of the delay
			// with setTimeout, we can pass a function with parameters for the signal
			// see the concept of Closures for more details
			setTimeout(
				function(_this,_parsedProp,_value) {  
					_parsedProp.targetObject[_parsedProp.property] = _value;
					_this.onActionFinished();
				},
				1000 * actionData.delay,
				//parameters
				this, parsedProp, actionData.properties[key]
			);

		//else just call the function right now
		}else{		
			parsedProp.targetObject[parsedProp.property] = actionData.properties[key];
			this.onActionFinished();
		}
	}
}

//===========================================================
//				TWEENING PROCESS
//===========================================================

/**
* Tween properties can be composite. By example, if we have a property like "body.x", the tween
* actually acts on the body itself as a target, not the entity.
* So we have to manually parse the properties and create the tween on the right objects.
*/
Phaser.Plugin.CutsceneManager.prototype.processTween = function(_currentAction,_target){

	var actionData = _currentAction.data;


	//we are prepared to act on several properties, so we may need to add action internaly
	//we have to substract one action so that we don't end up with to many afterwards
	this.actionsForEvent --;

	for(var key in actionData.properties){
		this.actionsForEvent ++;
		//parse the key and find the property on which the tween will act
		var parsedProp = getPropertyTargetByString(_target,key);
		//console.log(parsedProp);
		//create a new properties object
		var newProperties = {};
		newProperties[parsedProp.property] = actionData.properties[key];

		//process relativeness (?). If a tween is marked as relative, the movement on x & y will be computed from the gameobject's current position
		if( actionData.relative != null && actionData.relative == true ){
			/*if( newProperties.x != null) newProperties.x += _target.x;
			if( newProperties.y != null) newProperties.y += _target.y;*/
			newProperties[targetData.property] += _target[targetData.property];
		}

		//repeat process. -1 is taken as infinite time of repeart (it's a loop then)
		if( actionData.repeat && actionData.repeat < 0)
			actionData.repeat = Number.MAX_VALUE;

		//We can finally create the tween
		this.createTween(newProperties,parsedProp.targetObject,
						actionData.delay,actionData.duration,
						actionData.repeat, actionData.yoyo);
	}

}

/**
* Creates a tween for the targeted object and start it
*/
Phaser.Plugin.CutsceneManager.prototype.createTween = function(_properties,_target,_delay,_duration,_repeat,_yoyo){
	//Create a new tween
	var tween = this.game.add.tween(_target);
	//set propeties to tweeen
	tween.to(_properties,Phaser.Timer.SECOND * _duration);
	//set optional values
	if( _delay != null ) tween.delay( Phaser.Timer.SECOND * _delay ); 
	if( _repeat != null ) tween.repeat(_repeat);
	if( _yoyo != null ) tween.yoyo(_yoyo);
	//tells the tween to call onActionFinished when it's over. If looping, call it now
	if( _repeat != Number.MAX_VALUE)
		tween.onComplete.add( this.onActionFinished, this );
	else
		this.onActionFinished();
	//start the tween
	tween.start();
	return tween;
}

/**
* Calls a function on the _target GameObject
*/
Phaser.Plugin.CutsceneManager.prototype.callFunction = function(_currentAction,_target){
	//console.log("callFunction");
	//if there is a delay before calling the function 
	if( _currentAction.data.delay != null && _currentAction.data.delay > 0){
		//set a timer
		this.game.time.events.add(
			Phaser.Timer.SECOND * _currentAction.data.delay, 
			function(){
				_target.sendMessage(_currentAction.data.functionName, _currentAction.data.args);
				this.onActionFinished();
			},
			this);

	//else just call the function right now
	}else{		
		_target.sendMessage(_currentAction.data.functionName, _currentAction.data.args);
		this.onActionFinished();
	}
}

/**
* This function returns the target object of the tween property defined by the string
* ie : if string = "body.x"
* the return value will be the body property of the object
* If a property is not found, the object is returned as itself
* example of returned object :
* { targetObject : P2.Body... , property : "x"}
*/
function getPropertyTargetByString( _object, _string){
	var returnObject = { targetObject : _object, property : _string};
	var arrayProp = _string.split('.');
	if(arrayProp.length < 2)
		return returnObject;

	var currentProp = _object;
	for(var i=0; i < arrayProp.length -1; i++){
		if( _object.hasOwnProperty(arrayProp[i])){
			currentProp = currentProp[arrayProp[i]];
		}else{
			return returnObject;
		}
	}

	returnObject.targetObject = currentProp; // the target is the property we found
	returnObject.property = arrayProp[arrayProp.length-1]; // the tweened property is the last in the array
	
	return returnObject;
}

//================================================================
//					OTHER FUNCTIONS
//================================================================

/**
* This is an array that can be used to know which functions can be called as "other"
* This will mostly be used by the editor
*/
Phaser.Plugin.CutsceneManager.otherFunctions = [
	"moveCamera", "resetCamera", "cameraFollow",
	"freezeInputAll", "unfreezeInputAll", "freezeInput", "unfreezeInput",
	"changeLevel"
];

Phaser.Plugin.CutsceneManager.prototype.moveCamera = function(_args){
	//process relativeness (?). If a tween is marked as relative, the movement on x & y will be computed from the gameobject's current position
	if( _args.relative != null && _args.relative == true ){
		if( _args.properties.x != null) _args.properties.x += this.game.camera.x;
		if( _args.properties.y != null) _args.properties.y += this.game.camera.y;
	}
	//if a gameobject is targeted
	if( _args.target != null){
		var go = this.game.state.getCurrentState().findGameObjectByName(_args.target);
		if( go ){
			//compute direction from the center of the camera to the entity
			var point = new Phaser.Point();
			_args.properties.x = go.entity.x - this.game.camera.width * 0.5;
			_args.properties.y = go.entity.y - this.game.camera.height * 0.5;
		}else{
			return true;
		}
	}
	//we need to disable following for the tween to work
	this.game.camera.target = null;
	var tweenCam = this.createTween(_args.properties,this.game.camera,_args.delay,_args.duration,_args.repeat,_args.yoyo);
	return false;
}

Phaser.Plugin.CutsceneManager.prototype.cameraFollow = function(_args){
	var go = this.game.state.getCurrentState().findGameObjectByName(_args.target);
	if( go )
		this.game.camera.follow(go.entity);
	return true;
}

Phaser.Plugin.CutsceneManager.prototype.resetCamera = function(_args){
	if( this.cameraData.lastTarget){
		this.game.camera.target = this.cameraData.lastTarget;
	}else{
		this.game.camera.x = this.cameraData.lastX;
		this.game.camera.y = this.cameraData.lastY;
	}
	return true;
}

//================= INPUT ====================================

Phaser.Plugin.CutsceneManager.prototype.freezeInputAll = function(_args){
	if( this.game.inputManager ){
		this.game.inputManager.freezeInputAll();
	}
	return true;
}

Phaser.Plugin.CutsceneManager.prototype.unfreezeInputAll = function(_args){
	if( this.game.inputManager ){
		this.game.inputManager.unfreezeInputAll();
	}
	return true;
}

Phaser.Plugin.CutsceneManager.prototype.freezeInput = function(_args){
	if( this.game.inputManager ){
		if( this.game.inputManager ){
			if( _args.keys != null){
				this.game.inputManager.freezeInputKeys(_args.keys);
			}
			if( _args.mouse ){
				this.game.inputManager.freezeInputMouse(_args.mouse);
			}
		}
	}
	return true;
}

Phaser.Plugin.CutsceneManager.prototype.unfreezeInput = function(_args){
	if( this.game.inputManager ){
		if( _args.keys != null){
			this.game.inputManager.unfreezeInputKeys(_args.keys);
		}
		if( _args.mouse ){
			this.game.inputManager.unfreezeInputMouse(_args.mouse);
		}
	}
	return true;
}

//================= CHANGE LEVEL ====================================

Phaser.Plugin.CutsceneManager.prototype.changeLevel = function(_args){
	this.game.state.start("Level", true, false, {levelName: _args.levelName});
}