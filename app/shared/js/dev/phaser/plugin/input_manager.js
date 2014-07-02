"use strict";
/**
* InputManager refers to input keys as actions, and not as number.
* By this way, you can bind callbacks to an action, then change the key triggering this action or freeze it for every
* callback bound to this action
*
* How to use it:
* game.plugins.add(Phaser.Plugin.InputManager);
*
* Common usage :
* 1. Create Keys Data :
*	 var keysData = {"valid" : { key : Phaser.Keyboard.SPACEBAR }, "cancel" : { key : Phaser.Keyboard.C } };
* 2. Init 
*	 game.inputManager.init(keysData);
* 3. Bind a Key to an Action 
*	 game.inputManager.bindKeyPress("valid",callback,context,priority);
*
* NB : You can associate a priority to the callbacks you register. If a callback returns true,
* the other callbacks of lower priority for this same event won't be triggered.
*
* 4. When the SPACEBAR is pressed, every callback bound to "valid" action will be triggered
*
* Warning: this class is a singleton.
* @class InputManager
* @constructor
*/
Phaser.Plugin.InputManager = function(_game, _parent) {

	if (Phaser.Plugin.InputManager.INSTANCE == null) {
		Phaser.Plugin.call(this, _game, _parent);

		Phaser.Plugin.InputManager.INSTANCE = this;
		_game.inputManager = Phaser.Plugin.InputManager.INSTANCE;
	}

	this.keysData = new Object();

	this.mouseEventsTargets = new Object();

	return Phaser.Plugin.InputManager.INSTANCE;
};

Phaser.Plugin.InputManager.prototype = Object.create(Phaser.Plugin);
Phaser.Plugin.InputManager.prototype.constructor = Phaser.Plugin.InputManager;

Phaser.Plugin.InputManager.INSTANCE = null;

/**
* Init all the keys binding and mouse events
*
* @method init
* @param {Object} keysData See common usage in the class description
*/
Phaser.Plugin.InputManager.prototype.init = function(_keysData){

	this.game.input.mouse.capture = true; // prevent scroll wheel and middle click default behaviour
	this.game.input.onDown.add(this.onMouseDown,this);	
	this.game.input.onUp.add(this.onMouseUp,this);	
	this.initMouseWheelEvents();
	this.mouseEventsTargets["justPressed"] = new Array();
	this.mouseEventsTargets["justReleased"] = new Array();
	this.mouseEventsTargets["wheel"] = new Array();
	this.mouseEventsTargets.frozenButtons = [false,false,false];

	if( _keysData == null ) return;

	//Go through all input keys of the game
	for( var keyName in _keysData ){
		var keyObject = _keysData[keyName];
		this.createActionKey(keyName,keyObject.key,keyObject.capture);
	}
}

/**
* Creates an action key data and add it to the input manager
* ie : createActionKey("valid", Phaser.Keyboard.SPACEBAR,false);
*
* @method createActionKey
* @param {string} actionName The name of the action key
* @param {Number} key 
* @param {boolean} capture Should this key still be listen by the browser. null is true.
*/
Phaser.Plugin.InputManager.prototype.createActionKey = function(_actionName, _key, _capture){
	//the data of the key
	var data = new Object();
	data.id = _key;
	data.frozen = false;

	//add a listener in the game for this key
	data.key = this.game.input.keyboard.addKey(data.id);

	//By default Phaser override the key capture. We don't always want this
	if( _capture != null && _capture == false)
		this.game.input.keyboard.removeKeyCapture(data.id);

	data.key.lr_name = _actionName;

	//add our callbacks to the key events
	data.key.onDown.add( this.onKeyDown,this);
	data.key.onUp.add( this.onKeyUp,this);
	//also create an object for events that we'll be forwarded
	data.eventsPress = new Array();
	data.eventsRelease = new Array();

	//Store Action Data
	this.keysData[_actionName] = data;
}

//====================================================================
//						CALLBACKS
//====================================================================

Phaser.Plugin.InputManager.prototype.onMouseDown = function(_event){
	if( this.isMouseButtonFrozen( _event.button ) )
		return;
	this.callMouseEvents("justPressed",_event.button);
}

Phaser.Plugin.InputManager.prototype.onMouseUp = function(_event){
	if( this.isMouseButtonFrozen( _event.button ) )
		return;
	this.callMouseEvents("justReleased",_event.button);
}

Phaser.Plugin.InputManager.prototype.onMouseWheel = function(_event,_args){
	if( this.isMouseButtonFrozen( Phaser.Mouse.MIDDLE_BUTTON ) )
		return;
	// cross-browser wheel delta
	var e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	//we are in the html context, so "this" is a <div>, not an instance of InputManager anymore
	this.callMouseEvents("wheel",Phaser.Mouse.MIDDLE_BUTTON,{"delta": delta} );
	if (e.preventDefault)
        e.preventDefault();
}

// Called when a listened key is pressed down
Phaser.Plugin.InputManager.prototype.onKeyDown = function(_key){
	//check input freeze
	if( this.keysData[_key.lr_name].frozen)
		return;
	//Trigger all events for this action
	this.callKeyEvents(this.keysData[_key.lr_name].eventsPress, _key);
}

// Called when a listened key is released
Phaser.Plugin.InputManager.prototype.onKeyUp = function(_key){
	//check input freeze
	if( this.keysData[_key.lr_name].frozen)
		return;
	//Trigger all events for this action
	this.callKeyEvents(this.keysData[_key.lr_name].eventsRelease, _key);
}

//====================================================================
//						BINDING
//====================================================================

/**
* Binds a callback to the mouse left press event
*
* @method bindMousePress
* @param {function} callback
* @param {Object} context
* @param {Number} button Phaser.Mouse.[LEFT_BUTTON,RIGHT_BUTTON,MIDDLE_BUTTON]
* @param {Number} priority The priority of the callback
*/
Phaser.Plugin.InputManager.prototype.bindMousePress = function(_callback,_context,_button,_priority){
	if( _button == null ) _button = Phaser.Mouse.LEFT_BUTTON;
	if( _priority == null ) _priority = 1;

	var data = { callback : _callback ,
				 context : _context,
				 button : _button,
				 priority : _priority } ;
	//We want to insert this callback according to its priority
	var i = 0;
	for( i=0; i < this.mouseEventsTargets.justPressed.length; i++ ){
		if( _priority < this.mouseEventsTargets.justPressed[i].priority )
			break;
	}
	this.mouseEventsTargets.justPressed.splice( i, 0, data );
}

/**
* Binds a callback to the mouse left release event
*
* @method bindMousePress
* @param {function} callback
* @param {Object} context
* @param {Number} button Phaser.Mouse.[LEFT_BUTTON,RIGHT_BUTTON,MIDDLE_BUTTON]
* @param {Number} priority The priority of the callback
*/
Phaser.Plugin.InputManager.prototype.bindMouseRelease = function(_callback,_context,_button,_priority){
	if( _button == null ) _button = Phaser.Mouse.LEFT_BUTTON;
	if( _priority == null ) _priority = 1;

	var data = { callback : _callback ,
				 context : _context,
				 button : _button,
				 priority : _priority } ;
	//We want to insert this callback according to its priority
	var i = 0;
	for( i=0; i < this.mouseEventsTargets.justReleased.length; i++ ){
		if( _priority < this.mouseEventsTargets.justReleased[i].priority )
			break;
	}
	this.mouseEventsTargets.justReleased.splice( i, 0, data );	
}

/**
* Binds a callback to the mouse wheel event. 
* The callback should have an object in its parameter. It contains a delta property corresponding to the direction of the mousewheel
*
* @method bindMouseWheel
* @param {function} callback
* @param {Object} context
* @param {Number} priority The priority of the callback
*/
Phaser.Plugin.InputManager.prototype.bindMouseWheel = function(_callback,_context,_priority){
	if( _priority == null ) _priority = 1;

	var data = { callback : _callback ,
				 context : _context,
				 button : Phaser.Mouse.MIDDLE_BUTTON,
				 priority : _priority } ;
	//We want to insert this callback according to its priority
	var i = 0;
	for( i=0; i < this.mouseEventsTargets.wheel.length; i++ ){
		if( _priority < this.mouseEventsTargets.wheel[i].priority )
			break;
	}
	this.mouseEventsTargets.wheel.splice( i, 0, data );
}

/**
* Binds a key to the manager. The _functionBinded will be triggered on the _callbackContext when the key bound to the _actionInputName is pressed
* Note that the function binded can expect a Phaser.Key parameter
* 
* @method bindKeyPress
* @param {string} actionInputName The action we want to bind to
* @param {function} functionBinded The function that will be called when the action is performed
* @param {Object} callbackContext The context of the function
* @param {Number} priority Priority of the callback. See enablePriority for more details
*/
Phaser.Plugin.InputManager.prototype.bindKeyPress = function(_actionInputName,_functionBinded,_callbackContext,_priority){
	if(this.keysData[_actionInputName] == null ){
		console.log(_actionInputName + " key not found");
		return;
	}
	if( _priority == null ) _priority = 1;
	//this is the data for the key
	var callbackData = {
				callback : _functionBinded,
				context : _callbackContext,
				priority : _priority
				};

	this.pushKeyCallbackData("eventsPress",_actionInputName,callbackData);
}

/**
* Binds a key to the manager. The _functionBinded will be triggered on the _callbackContext when the key bound to the _actionInputName is pressed
* Note that the function binded can expect a Phaser.Key parameter
*
* @method bindKeyUp
* @param {string} actionInputName The action we want to bind to
* @param {function} functionBinded The function that will be called when the action is performed
* @param {Object} callbackContext The context of the function
* @param {Number} priority Priority of the callback. See enablePriority for more details
*/
Phaser.Plugin.InputManager.prototype.bindKeyRelease = function(_actionInputName,_functionBinded,_callbackContext,_priority){
	if(this.keysData[_actionInputName] == null ){
		console.log(_actionInputName + " key not found");
		return;
	}
	if( _priority == null ) _priority = 1;
	//this is the data for the key
	var callbackData = {
				callback : _functionBinded,
				context : _callbackContext,
				priority : _priority
				};

	this.pushKeyCallbackData("eventsRelease",_actionInputName,callbackData);
}

//=====================================================================================
//									UTILS CALLBACK
//=====================================================================================

//push a callback in the callbacks array of an action
Phaser.Plugin.InputManager.prototype.pushKeyCallbackData = function(_event,_actionName, _callbackData){
	var dataKey = this.keysData[_actionName];
	//We want to insert this callback according to its priority
	var i = 0;
	for( i=0; i < dataKey[_event].length; i++ ){
		if( dataKey[_event].priority )
			break;
	}
	dataKey[_event].splice( i, 0, _callbackData );
}

//calls every callbacks binded to the mouse event specified
Phaser.Plugin.InputManager.prototype.callMouseEvents = function(_eventName,_button,_args){
	var array = this.mouseEventsTargets[_eventName];
	if( array.length == 0 )
		return;
	var priorityTaken = false;
	var curPriority = array[0].priority;
	//for each callback
	for( var i=0; i < array.length ; i++ ){
		//check if priority changed
		if( curPriority != array[i].priority ){
			if( priorityTaken )
				break;
			curPriority = array[i].priority;
		}
		//Call the callback
		if( array[i].button == null || _button == array[i].button){
			var res = array[i].callback.call(array[i].context,_args);
			if( res == true)
				priorityTaken = true;
		}
	}
}

Phaser.Plugin.InputManager.prototype.callKeyEvents = function(_events,_key){
	if( _events.length == 0 )
		return;
	var priorityTaken = false;
	var curPriority = _events[0].priority;
	//for each callback
	for( var i=0; i < _events.length ; i++ ){
		//check if priority changed
		if( curPriority != _events[i].priority ){
			if( priorityTaken )
				break;
			curPriority = _events[i].priority;
		}
		//Call the callback
		var res = _events[i].callback.call(_events[i].context,_key);
		if( res == true)
			priorityTaken = true;
	}
}

//=====================================================================================
//									MOUSE WHEEL
//=====================================================================================

//Add a listener to the mouse wheel event
Phaser.Plugin.InputManager.prototype.initMouseWheelEvents = function(){
		var element = document.getElementById("phaser");	
	    // IE9, Chrome, Safari, Opera
	    element.addEventListener("mousewheel", this.onMouseWheel.bind(this), false);
	    // Firefox
	    element.addEventListener("DOMMouseScroll", this.onMouseWheel.bind(this), false);
}

//=====================================================================================
//									INPUT FREEZE
//=====================================================================================

/**
* Freezes all the inputs
*
* @method freezeInputAll
*/
Phaser.Plugin.InputManager.prototype.freezeInputAll = function(){	
	this.freezeInputMouse([0,1,2]);
	console.log(this.mouseEventsTargets);
	for(var keyName in this.keysData){
		this.keysData[keyName].frozen = true;
	}
}

/**
* Unfreezes all the inputs
*
* @method unfreezeInputAll
*/
Phaser.Plugin.InputManager.prototype.unfreezeInputAll = function(){
	this.unfreezeInputMouse([0,1,2]);
	for(var keyName in this.keysData){
		this.keysData[keyName].frozen = false;
	}
}

/**
* Freezes the input keys for the specified action
*
* @method freezeInputKeys
* @param {_actionNames} actionNames ie ["valid","cancel"]
*/
Phaser.Plugin.InputManager.prototype.freezeInputKeys = function(_actionNames){
	for(var i=0; i < _actionNames.length; i++){
		var actionName = _actionNames[i];
		if( this.keysData.hasOwnProperty(actionName)){
			this.keysData[actionName].frozen = true;
		}
	}
}

/**
* Unfreezes the input keys for the specified action
*
* @method unfreezeInputKeys
* @param {_actionNames} actionNames ie ["valid","cancel"]
*/
Phaser.Plugin.InputManager.prototype.unfreezeInputKeys = function(_actionNames){
	for(var i=0; i < _actionNames.length; i++){
		var actionName = _actionNames[i];
		if( this.keysData.hasOwnProperty(actionName)){
			this.keysData[actionName].frozen = false;
		}
	}
}

/**
* Freezes the mouse input for the specified buttons
*
* @method freezeInputMouse
* @param {_buttons} buttons ie : [ Phaser.MOUSE.LEFT_BUTTON ]
*/
Phaser.Plugin.InputManager.prototype.freezeInputMouse = function( _buttons ){
	for(var i = 0 ; i < _buttons.length ; i++){
		var buttonID = _buttons[i];
		if( buttonID < this.mouseEventsTargets.frozenButtons.length)
			this.mouseEventsTargets.frozenButtons[buttonID] = true;
	}
}

/**
* Unfreezes the mouse input for the specified buttons
*
* @method unfreezeInputMouse
* @param {_buttons} buttons ie : [ Phaser.MOUSE.LEFT_BUTTON ]
*/
Phaser.Plugin.InputManager.prototype.unfreezeInputMouse = function( _buttons ){
	for(var i = 0 ; i < _buttons.length ; i++){
		var buttonID = _buttons[i];
		if( buttonID < this.mouseEventsTargets.frozenButtons.length)
			this.mouseEventsTargets.frozenButtons[buttonID] = false;
	}
}

Phaser.Plugin.InputManager.prototype.isMouseButtonFrozen = function( _button ){
	if( _button < this.mouseEventsTargets.frozenButtons.length)
		return this.mouseEventsTargets.frozenButtons[_button];
	return false;
}

//=====================================================================================
//									CLEAR
//=====================================================================================

Phaser.Plugin.InputManager.prototype.clearAll = function(){		
	this.mouseEventsTargets["justPressed"] = new Array();
	this.mouseEventsTargets["justReleased"] = new Array();
	this.mouseEventsTargets["wheel"] = new Array();

	for(var keyName in this.keysData){
		var key = this.keysData[keyName];
		key.eventsPress = new Array();
		key.eventsRelease = new Array();
	}
}