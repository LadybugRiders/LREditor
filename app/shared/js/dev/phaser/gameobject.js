"use strict";
/**
* Base object 
*
* @namespace LR
* @class GameObject
* @constructor
* @param {LR.Sprite | LR.Group | LR.TileSprite} LR entity
*/
LR.GameObject = function(_entity) {
	/**
	* ID of the gameobject
	*
	* @property id
	* @type Number
	* @default -1
	*/
	this.id = -1;
	/*
	* LR entity
	* 
	* @property entity
	* @type {LR.Sprite | LR.Group | LR.TileSprite}
	* @default null
	*/
	this.entity = _entity;

	/**
	* The collision layer index used to filter collisions
	* @property layer
	* @type {string}
	* @default "default"
	*/
	this.layer = "default";
	
	/**
	* The behaviours attached to the gameobject
	* @property behaviours
	* @type {Array}
	* @default array
	*/
	this.behaviours = new Array();

	/**
	* Sounds that can be played by the GameObject. Contains Phaser.Sound objects.
	*
	* @property sounds
	* @type Object
	* @default {}
	*/
	this.sounds = new Object();

	/**
	* A reference to the current CollisionManager. Set when the GameObject is added to the CollisionManager
	* @property collisionManager
	* @type {CollisionManager}
	* @default null
	*/
	this.collisionManager = null;

	/*
	* If this is enabled, the gameobject will send contact events to its behaviours. Use enableEvents().
	* @property enableContactEvents
	* @type {boolean}
	* @default false
	*/
	this.enableContactEvents = false;

	this.debugBounds = false;

	if( _entity != null ){
		/**
		* Reference to the game
		*
		* @property game
		* @type Phaser.Game
		* @default null
		*/
		this.game = _entity.game;
		this.entity.gameobject = this;
	}

	//broadphase
	this.broadphaseListened = false;
	this.postBroadphaseCallback = null;
	this.postBroadphaseContext = null;

	//behaviours to remove
	this._behavioursToRemove = new Array();

	this.tweensData = new Object();
};

LR.GameObject.prototype.constructor = LR.GameObject;

// Called when the scene is launching. All objects are created then.
LR.GameObject.prototype.start = function() {
	if (this.entity.exists && this.behaviours) {
		for(var i=0; i < this.behaviours.length; i++){
			if( this.behaviours[i].start != null && this.behaviours[i].enabled )
				this.behaviours[i].start();
		}
	}
};

LR.GameObject.prototype.update = function() {
	if (this.entity.exists && this.behaviours) {
		var canUpate = true;
		if (this.entity.game.state.forbidUpdate == true) {
			canUpate = false;
		}

		if (canUpate) {
			for(var i=0; i < this.behaviours.length; i++){
				if( this.behaviours[i].update != null && this.behaviours[i].enabled  )
					this.behaviours[i].update();
			}
		}
	}
};

LR.GameObject.prototype.postUpdate = function() {
	if (this.entity.exists && this._behavioursToRemove.length > 0) {
		for(var r=0; r < this._behavioursToRemove.length; r++){
			var bh = this._behavioursToRemove[r];
			for( var i = 0; i < this.behaviours.length; i++){
				if( this.behaviours[i] === bh){
					this.behaviours.splice(i,1);
				}
			}
		}
	}
	//call postUpdate of behaviours
	for(var i=0; i < this.behaviours.length; i++){
		if( this.behaviours[i].postUpdate != null)
			this.behaviours[i].postUpdate();
	}
};

LR.GameObject.prototype.render = function() {
	if( this.entity.exists ){
		for(var i=0; i < this.behaviours.length; i++){
			if( this.behaviours[i].render != null && this.behaviours[i].enabled  )
				this.behaviours[i].render();
		}
	}
};

LR.GameObject.prototype.destroy = function() {
	if( this.entity.exists ){
		for(var i=0; i < this.behaviours.length; i++){
			if( this.behaviours[i].destroy != null )
				this.behaviours[i].destroy();
		}
		this.behaviours = new Array();
	}
	//clear collisions on the body
	if( this.entity.body != null ){
		this.entity.body.clearCollision(true,true);
		this.removePhysics();
	}
};

//============================================================
//						PHYSICS
//============================================================

/**
* Creates a body and enable physics for the gameobject
* Also creates a variable go in the {P2.Body} body
*
* @method enablePhysics
* @param {number} motionState : pick STATIC, KINEMATIC or DYNAMIC from Phaser.Physics.P2.Body. Default is DYNAMIC
* @param {string} layer : the layer of collision. null will let it to "default".
* @param {number} <optional> width : new width of the body rectangle. Won't do anything without height.
* @param {number} <optional> height : new height of the body rectangle
*/
LR.GameObject.prototype.enablePhysics = function(_motionState,_layer,_width,_height){
	if( this.body == null){
		if (this.entity.hasOwnProperty('body') && this.entity.body === null)
        {
            this.entity.body = new LR.Body(this.game, this.entity, this.entity.x, this.entity.y, 1);
            //this.entity.game.physics.p2.enable(this.entity,false);
            this.entity.anchor.set(0.5);
        }
		this.body.data.shapes[0].lr_name = "mainShape";
	}

	this.body.go = this;
	this.body.debug = this.debugBounds;
	// Set Motion State
	this.setMotionState(_motionState);
	//LAYER
	if( _layer != null )
		this.layer = _layer;
	//Set Rectangle
	if( _width != null && _height != null ){
		this.body.setRectangle(_width,_height,0,0,0);
	}
	return this.entity.body;
}



/**
* Removes the body from the world 
*
* @method removePhysics
*/
LR.GameObject.prototype.removePhysics = function(){
	if( this.entity.body != null){
		this.entity.body.removeFromWorld();
		this.entity.body.destroy();
	}
}

/**
* Enables the behaviours of the gameobject to receive the contact events
* Without that, onBeginContact and onEndContact are never called
* @method enableEvents 
*/
LR.GameObject.prototype.enableEvents = function(){
	this.enableContactEvents = true;
	if( this.body != null ){
		this.body.onBeginContact.add(this.onBeginContact, this);
		this.body.onEndContact.add(this.onEndContact, this);
	}
}

/**
* Disable the behaviours of the gameobject to receive the contact events
* The onBeginContact and onEndContact will not be called anymore
* @method disableEvents 
*/
LR.GameObject.prototype.disableEvents = function(){
	this.enableContactEvents = false;
	if( this.body != null ){
		this.body.onBeginContact.remove(this.onBeginContact, this);
		this.body.onEndContact.remove(this.onEndContact, this);
	}
}

/**
* Enables the sensor behaviour of the shapes of the GameObject
* @method enableSensor
* @param {Array} indexes Array of indexes of the shapes with we want to be sensors. If null, all the shapes will be sensors.
*/
LR.GameObject.prototype.enableSensor = function(_indexes){
	if( this.body == null)
		return;
	var shapes = this.body.data.shapes;
	if(_indexes == null){
		for(var i=0 ; i < shapes.length; i++){
			shapes[i].sensor = true;
		}
	}else{
		for(var i=0 ; i < _indexes.length; i++){
			var index = _indexes[i];
			if( index < 0 || index >= shapes.length)
				continue;
			shapes[index].sensor = true;
		}
	}
}

/**
* Disables the sensor behaviour of the shapes of the GameObject
* @method disableSensor
* @param {Array} indexes Array of indexes of the shapes with we want to be physical. If null, all the shapes will be solid.
*/
LR.GameObject.prototype.disableSensor = function(_indexes){
	if( this.body == null)
		return;
	var shapes = this.body.data.shapes;
	if(_indexes == null){
		for(var i=0 ; i < shapes.length; i++){
			shapes[i].sensor = false;
		}
	}else{
		for(var i=0 ; i < _indexes.length; i++){
			var index = _indexes[i];
			if( index < 0 || index >= shapes.length)
				continue;
			shapes[index].sensor = false;
		}
	}
}

/**
* Enable Bounds to be displayed ( if no body is affected yet, this will be effective when one is added )
* @method enableDebugBounds
*/
LR.GameObject.prototype.enableDebugBounds = function(){
	this.debugBounds = true;
	if( this.body == null)
		return;
	this.body.debug = true;
}

/**
* Disable Bounds display( if no body is affected yet, this will be effective when one is added )
* @method disableDebugBounds
*/
LR.GameObject.prototype.disableDebugBounds = function(){
	this.debugBounds = false;
	if( this.body == null)
		return;
	this.body.debug = false;
}

/**
* Changes the motion state of the gameobject body
*
*@method setMotionState
*@param {number} motionState PhysicsSettings.STATIC, PhysicsSettings.KINEMATIC or PhysicsSettings.DYNAMIC
*/
LR.GameObject.prototype.setMotionState = function(_motionState){
	if(_motionState != null){
		this.body.motionState = _motionState;
		if( _motionState == Phaser.Physics.P2.Body.STATIC){
			this.body.mass = 0;
		}else{
			this.body.mass = 1;
		}
	}
}

/**
* Changes the current layer of the object, resetting collisions groups
*
* @method changeLayer
* @param {string} layer
*/
LR.GameObject.prototype.changeLayer = function(_layer){
	this.layer = _layer;
	if( this.collisionManager != null ){
		this.collisionManager.changeGameObjectLayer(this,_layer,this.enableContactEvents);
	}
}

//======================================================================
//					CONTACT CALLBACK
//======================================================================

/**
* Sets the callback for the postbroadphase
* Postbroadphase is called BEFORE "enabling" any collision. You can then prevent a collision from happening
* The callback should return true to validate a collision ( make it effective in game) 
* The callback will have the colliding body passed in parameter
*
* @method setPostBroadPhaseCallback
* @param {method} callback
* @param {Behaviour} context
*/
LR.GameObject.prototype.setPostBroadPhaseCallback = function(_callback, _context){
	this.broadphaseListened = true;
	this.postBroadphaseContext = _context;
	this.postBroadphaseCallback = _callback;
	if( _callback == null || _context == null )
		this.broadphaseListened = false;
}

/**
* Called by the CollisionManager when the body of the GameObject is concerned in the postBroadphase
* Basically, this method is called before a collision with another body will appear.
* You can then decide if you want to let the collision happen 
* 
* First link your callback with setPostBroadPhaseCallback(callback,context)
* The callback method must return true if you want this gameobject to collide with the otherbody, false instead.
*
* NB: This is called BEFORE onBeginContact
*
* @method onPostBroadPhase
* @param {param_type} param_description
*/
LR.GameObject.prototype.onPostBroadPhase = function(_body){
	if( this.postBroadphaseCallback != null){
		return this.postBroadphaseCallback .call(this.postBroadphaseContext,_body);
	}
	return true;
}

LR.GameObject.prototype.onBeginContact = function(_otherBody, _otherShape, _myShape, _equation){
	for(var i=0; i < this.behaviours.length; i++){
		if( this.behaviours[i].onBeginContact != null && this.behaviours[i].enabled && this.behaviours[i].enableEvents )
			this.behaviours[i].onBeginContact(_otherBody, _otherShape, _myShape, _equation);
	}
}

LR.GameObject.prototype.onContact = function(_body2){
	//console.log("contact!");
	for(var i=0; i < this.behaviours.length; i++){
		if( this.behaviours[i].onContact != null && this.behaviours[i].enabled && this.behaviours[i].enableEvents )
			this.behaviours[i].onContact(_body2);
	}
}

LR.GameObject.prototype.onEndContact = function(_otherBody, _otherShape, _myShape){
	//console.log("===collision ends from " + this.name);
	//console.log("onBody : " + _otherBody.sprite.go.name);
	for(var i=0; i < this.behaviours.length; i++){
		if( this.behaviours[i].onEndContact != null && this.behaviours[i].enabled && this.behaviours[i].enableEvents )
			this.behaviours[i].onEndContact(_otherBody, _otherShape, _myShape);
	}
}

//============================================================
//					BEHAVIOURS
//============================================================

/**
* Adds a behaviour to the gameobject
* @method addBehaviour
* @param {Behaviour} behaviour Behaviour instance
* @return the behaviour 
*/
LR.GameObject.prototype.addBehaviour = function(_behaviour) {
	this.behaviours.push(_behaviour);
	return _behaviour;
}

/**
* Removes a behaviour from the gameobject
* @method removeBehaviour
* @param {Behaviour} behaviour Behaviour instance
* @return the behaviour 
*/
LR.GameObject.prototype.removeBehaviour = function(_behaviour){
	if( _behaviour != null)
		this._behavioursToRemove.push( _behaviour );
}

/**
* Returns the requested behaviour. If more than one is attaced, the first one is return. Use getBehaviours if you need them all
* This could be expensive. Do not do this at every frame. 
* @method getBehaviour
* @param {Class} behaviour The behaviour class
* @returns {Behaviour} the behaviour, or null if not found
*/
LR.GameObject.prototype.getBehaviour = function( _script ){
	for(var i = 0 ; i < this.behaviours.length; i++){
		if(this.behaviours[i] instanceof _script)
			return this.behaviours[i];
	}
	return null;
}

/**
* Returns the requested behaviour attached to the GameObject or its children.
* If more than one is attached, the first one is return. Use getBehaviours if you need them all
* This could be expensive. Do not do this at every frame. 
* @method getBehaviourInChildren
* @param {Class} behaviour The behaviour class
* @returns {Behaviour} the behaviour, or null if not found
*/
LR.GameObject.prototype.getBehaviourInChildren = function( _script ){
	for(var i = 0 ; i < this.behaviours.length; i++){
		if(this.behaviours[i] instanceof _script)
			return this.behaviours[i];
	}

	if( this.entity.children ){
		for( var i=0; i < this.entity.children.length; i++){
			var script = this.entity.children[i].go.getBehaviourInChildren(_script);
			if( script )
				return script;
		}
	}
	return null;
}

/**
* Returns all the requested behaviours attached to the object. 
* This could be expensive. Do not do this at every frame. 
* @method getBehaviours
* @param {Class} behaviour The behaviour class
* @returns {Array} the behaviours in an array (might be empty)
*/
LR.GameObject.prototype.getBehaviours = function( _script ){
	var array = new Array();
	for(var i = 0 ; i < this.behaviours.length; i++){
		if(this.behaviours[i] instanceof _script)
			return array.push( this.behaviours[i] );
	}
	return array;
}

/**
* Returns all instances of the requested behaviour class attached to the GameObject and its children.
* This may be expensive. Do not do this at every frame. 
* @method getBehavioursInChildren
* @param {Class} behaviour The behaviour class
* @returns {Array} the behaviours in an array (might be empty)
*/
LR.GameObject.prototype.getBehavioursInChildren = function( _script, _array ){
	if( _array==null)
		_array = new Array();

	for(var i = 0 ; i < this.behaviours.length; i++){
		if(this.behaviours[i] instanceof _script)
			_array.push( this.behaviours[i] );
	}

	if( this.entity.children ){
		for( var i=0; i < this.entity.children.length; i++){
			_array.concat( this.entity.children[i].go.getBehavioursInChildren(_script,_array));	
		}
	}
	return _array;
}

/**
* Try to call the function on every behaviour attached to this GameObject 
* @method sendMessage
* @param {string} functionName
* @param {Object} messageObject : You might want to pass an object for the parameter of the function
*/
LR.GameObject.prototype.sendMessage = function(_functionName, _messageObject){
	var BH;
	for(var i=0; i < this.behaviours.length; i++){
		BH = this.behaviours[i];
		//try calling method directly
		if( BH[_functionName]){
			BH[_functionName](_messageObject);
		//if it fails, try calling the prototype's function
		}else if( BH.prototype && BH.prototype[_functionName]){
			BH.prototype[_functionName].call(BH,_messageObject);
		}
	}
}

//============================================================
//						SHAPES
//============================================================
/**
* Returns the number of shapes attached to the body
*
* @method getShapesCount
* @return integer
*/
LR.GameObject.prototype.getShapesCount = function(){
	if( this.body == null )
		return 0;
	return this.body.data.shapes.length;
}

/**
* Returns the wanted shape
*
* @method getShape
* @param {number} shapeIndex
* @return P2.Shape
*/
LR.GameObject.prototype.getShape = function(_shapeIndex){
	if( _shapeIndex == null )
		_shapeIndex = 0;
	if( this.body ){
		if( this.body.data.shapes.length > _shapeIndex ){
			return this.body.data.shapes[_shapeIndex];
		}
	}
	return null;
}

/**
* Returns the shape by its name (property lr_name)
* If many shapes share the same name, this method will return the first encountered in the shapes array
*
* @method getShapeByName
* @param {number} shapeName The name of the researched shape
* @return P2.Shape
*/
LR.GameObject.prototype.getShapeByName = function(_shapeName){
	for(var i=0; i < this.getShapesCount(); i++ ){
		if( this.getShape(i).lr_name == _shapeName ){
			return this.getShape(i);
		}
	}
	return null;
}

/**
* Returns the shapes by their names (property lr_name)
* 
* @method getShapesByNames
* @param {Array} shapeName The names of the researched shapes
* @return {Array} shapes found
*/
LR.GameObject.prototype.getShapesByNames = function(_shapesNames){
	var shapesFound = new Array();
	for(var i=0; i < this.getShapesCount(); i++ ){
		for( var iName = 0; iName < _shapesNames.length; iName ++){			
			if( this.getShape(i).lr_name == _shapesNames[iName] ){
				shapesFound.push( this.getShape(i) );
			}
		}
	}
	return shapesFound;
}

/**
* Returns the index of the shape found by its name (property lr_name)
* 
* @method getShapeIndexByName
* @param {Array} shapeName The index of the researched shape
* @return {Number} index
*/
LR.GameObject.prototype.getShapeIndexByName = function(_shapeName){
	for(var i=0; i < this.getShapesCount(); i++ ){
		if( this.getShape(i).lr_name == _shapeName ){
			return i;
		}
	}
	return -1;
}

/**
* Returns the size of the wanted shape. You can either pass its index or its name
*
* @method getShapeData
* @param {Number | string} shapeIndexOrName
* @return {Object} object containing the following properties : x, y, width, height (in pixels), rotation (in degrees), sensor (bool), name
*/
LR.GameObject.prototype.getShapeData = function(_shapeIndex){
	var data = new Object();

	if( typeof _shapeIndex == "string")
		_shapeIndex = this.getShapeIndexByName(_shapeIndex);

	if( _shapeIndex == null || _shapeIndex < 0)
		_shapeIndex = 0;
	var shape = this.getShape(_shapeIndex);
	if( shape ){
		data.x = this.game.physics.p2.mpxi( this.body.data.shapeOffsets[_shapeIndex][0] );
		data.y = this.game.physics.p2.mpxi( this.body.data.shapeOffsets[_shapeIndex][1] );
		if(LR.Utils.getShapeType(shape) == "rectangle"){
			data.width = this.game.physics.p2.mpx( shape.width );
			data.height = this.game.physics.p2.mpx( shape.height ); 
		}else if(LR.Utils.getShapeType(shape) == "circle"){
			data.radius = this.game.physics.p2.mpx(shape.radius);
		}
		data.rotation = LR.Utils.toDegrees( this.game.physics.p2.mpx( this.body.data.shapeAngles[_shapeIndex] ) );
		data.sensor = shape.sensor;
		data.name = shape.lr_name;
		data.type = LR.Utils.getShapeType(shape);
	}
	return data;
}

/**
* Replaces the shape at the given index with a new Rectangle, creating a new shape from the data provided
* This sahpe will be pushed to the end of shapes array if _shapeIndex is incorrect
*
* @method replaceShapeByRectangle
* @param {Number} shapeIndex
* @param {Object} data Can contain x {Number}, y{Number}, width{Number}, height{Number}, rotation{Number}, sensor {Boolean} properties, name {String}
* @return P2.Shape
*/
LR.GameObject.prototype.replaceShapeByRectangle = function(_shapeIndex, _data){
	//Make sure data is set
	if( _data.x == null ) _data.x = 0;
	if( _data.y == null ) _data.y = 0;
	if( _data.width == null ) _data.width = this.entity.width;
	if( _data.height == null ) _data.height = this.entity.height;
	if( _data.rotation == null ) _data.rotation = 0;

	//Create the new Rectangle from input _data
	var newShape = new p2.Rectangle(
					this.game.physics.p2.pxm( _data.width),
					this.game.physics.p2.pxm( _data.height)				
				);
	//Check index before inserting
	if( _shapeIndex < this.body.data.shapes.length && _shapeIndex >= 0 ){
		//keep the former name of the shape
		newShape.lr_name = this.body.data.shapes[_shapeIndex].lr_name;
		//affect new shape in place of the current one
		this.body.data.shapes[_shapeIndex] = newShape;
		this.body.data.shapeOffsets[_shapeIndex] = [this.game.physics.p2.pxmi(_data.x), this.game.physics.p2.pxmi(_data.y)];
		this.body.data.shapeAngles[_shapeIndex] = LR.Utils.toRadians(_data.rotation);
	}else{
		//if the _shapeIndex is incorrect, just add the new shape
		this.body.data.addShape(newShape,
								[this.game.physics.p2.pxmi(_data.x), this.game.physics.p2.pxmi(_data.y)],
								LR.Utils.toRadians(_data.rotation));
		if( _data.name == null ) 
			_data.name = "shape"+ _shapeIndex;
		newShape.lr_name = _data.name;
	}
	//Tells P2 to update the shapes
	this.body.data.updateMassProperties();
    this.body.data.updateBoundingRadius();
    this.body.data.aabbNeedsUpdate = true;
    //Tells Phaser.Body to update the shapes
    this.body.shapeChanged();
		
	return newShape;
}

/**
* Replaces the shape at the given index with a new Circle, creating a new shape from the data provided
* This shape will be pushed to the end of shapes array if _shapeIndex is incorrect
*
* @method replaceShapeByCircle
* @param {Number} shapeIndex
* @param {Object} data Can contain x {Number}, y{Number}, radius{Number}, rotation{Number}, sensor {Boolean} properties, name {String}
* @return P2.Shape
*/
LR.GameObject.prototype.replaceShapeByCircle = function(_shapeIndex, _data){
	//Make sure data is set
	if( _data.x == null ) _data.x = 0;
	if( _data.y == null ) _data.y = 0;
	if( _data.radius == null ) _data.radius = this.entity.radius;
	if( _data.rotation == null ) _data.rotation = 0;

	//Create the new Circle from input _data
	var newShape = new p2.Circle(
					this.game.physics.p2.pxm( _data.radius)				
				);
	//Check index before inserting
	if( _shapeIndex < this.body.data.shapes.length && _shapeIndex >= 0 ){
		//keep the former name of the shape
		newShape.lr_name = this.body.data.shapes[_shapeIndex].lr_name;
		//affect new shape in place of the current one
		this.body.data.shapes[_shapeIndex] = newShape;
		this.body.data.shapeOffsets[_shapeIndex] = [this.game.physics.p2.pxmi(_data.x), this.game.physics.p2.pxmi(_data.y)];
		this.body.data.shapeAngles[_shapeIndex] = LR.Utils.toRadians(_data.rotation);
	}else{
		//if the _shapeIndex is incorrect, just add the new shape
		this.body.data.addShape(newShape,
								[this.game.physics.p2.pxmi(_data.x), this.game.physics.p2.pxmi(_data.y)],
								LR.Utils.toRadians(_data.rotation));
		if( _data.name == null ) 
			_data.name = "shape"+ _shapeIndex;
		newShape.lr_name = _data.name;
	}
	//Tells P2 to update the shapes
	this.body.data.updateMassProperties();
    this.body.data.updateBoundingRadius();
    this.body.data.aabbNeedsUpdate = true;
    //Tells Phaser.Body to update the shapes
    this.body.shapeChanged();
		
	return newShape;
}

//============================================================
//						SOUNDS
//============================================================
LR.GameObject.prototype.addSound = function(_name,_sound){
	this.sounds[_name] = _sound;
}

/**
* Returns the specified sound
*
* @method getSound
* @param {String} name
* @return {Phaser.Sound}
*/
LR.GameObject.prototype.getSound = function(_name){
	return this.sounds[_name];
}

/**
* Plays the specified sound
*
* @method playSound
* @param {String} name
* @param {Number} volume 0 <= volume <= 1
* @param {boolean} loop
*/
LR.GameObject.prototype.playSound = function(_name,_volume,_loop){
	var sound = this.sounds[_name];
	if(sound)
		sound.play('',0,_volume,_loop);
}
//============================================================
//						SETTERS
//============================================================
/**
* Sets the position of the GameObject. Takes the body in account
*
* @method setPosition
* @param {number} x
* @param {number} y
*/
LR.GameObject.prototype.setPosition = function(_x, _y){
	if( this.body != null ){
		this.body.x = _x;
		this.body.y = _y;
	}else{
		this.entity.x = _x;
		this.entity.y = _y;
	}
}

/**
* Accessor to the entity's body. Read only.
*
* @property body
* @type Phaser.Physics.P2.Body
*/
Object.defineProperty( LR.GameObject.prototype, "body",
	{
		get : function(){
			return this.entity.body;
		}
	}
);

/**
* Accessor to the entity's x.
*
* @property x
* @type Number
*/
Object.defineProperty( LR.GameObject.prototype, "x",
	{
		get : function(){
			return this.entity.x;
		},

		set : function(_x){
			if( this.body != null ){
				this.body.x = _x;
			}else{
				this.entity.x = _x;
			}
		}
	}
);

/**
* Accessor to the entity's y.
*
* @property y
* @type Number
*/
Object.defineProperty( LR.GameObject.prototype, "y",
	{
		get : function(){
			return this.entity.y;
		},

		set : function(_y){
			if( this.body != null ){
				this.body.y = _y;
			}else{
				this.entity.y = _y;
			}
		}
	}
);

/**
* Accessor to the entity's world coordinates property (readonly)
*
* @property world
* @type {Phaser.Point}
*/
Object.defineProperty( LR.GameObject.prototype, "world",
	{
		get : function(){
			return this.entity.world;
		}
	}
);

/**
* Accessor to the body's gravity. Returns 0 if no body affected.
*
* @property gravity
* @type Number
*/
Object.defineProperty( LR.GameObject.prototype, "gravity",
	{
		get : function(){
			if( this.entity.body == null)
				return 0;
			return this.entity.body.data.gravityScale;
		},

		set : function(_gravity){
			if( this.entity.body != null ){
				this.entity.body.data.gravityScale = _gravity;
			}
		}
	}
);

/**
* Accessor to the body's velocityX in world coordinates. Returns 0 if no body affected.
*
* @property velocityX
* @type Number
*/
Object.defineProperty( LR.GameObject.prototype, "velocityX",
	{
		get : function(){
			if( this.entity.body == null)
				return 0;
			return this.entity.body.velocity.x;
		}
	}
);

/**
* Accessor to the body's velocityY in world coordinates. Returns 0 if no body affected.
*
* @property velocityX
* @type Number
*/
Object.defineProperty( LR.GameObject.prototype, "velocityY",
	{
		get : function(){
			if( this.entity.body == null)
				return 0;
			return this.entity.body.velocity.y;
		}
	}
);

/**
* Changes the parent of the entity
*
* @method changeParent
* @param {LR.Entity} newParent
*/
LR.GameObject.prototype.changeParent = function(_newParent){
	var oldParent = this.entity.parent;
	oldParent.remove(this.entity);
	_newParent.add(this.entity);
}


//============================================================
//						TWEEN
//============================================================

/**
* Adds a tween with the data specified
* example of input data : { "properties":{"body.x":100},"duration": 1000 ...etc..}
*
* @method addTween
* @param {Object} tweenData Object containing the tween properties
*/
LR.GameObject.prototype.addTween = function( _tweenData ){
	var newTween = new Object();
	newTween.data = JSON.parse( JSON.stringify( _tweenData) );
	newTween.tweensObject = new Object();
	newTween.count = 0;
	this.tweensData[_tweenData.name] = newTween;

	if(_tweenData.autoStart == true){
		this.launchTween(_tweenData.name);
	}
}

/**
* Launch the specified tween if previously added.
* If there are many target in the properties, many tweens will be launched
* 
* @method launchTween
* @param {string} tweenName The tween name. Use GameObject.addTween to add a tween
*/
LR.GameObject.prototype.launchTween = function(_tweenName){
	var launchedTweens = new Array();
	if(! this.tweensData.hasOwnProperty(_tweenName)){
		console.error( "Tween " + _tweenName + " not found on " + this.name + "[" + this.id + "]");
		return launchedTweens;
	}
	//Get tween  
	var tweenData = this.tweensData[_tweenName].data;
	var tweensObject = this.tweensData[_tweenName].tweensObject;
	this.tweensData[_tweenName].count = 0;
	//convert its properties
	var props = null;
	try{
		props = JSON.parse(tweenData.properties);
	}catch(e){
		console.error("Invalid JSON properties");
		return launchedTweens;
	}
	//Go throught all properties and launch tweens in editor
	//In the properties we may have several target, so we have to launch a tween
	//for each different target
	for(var key in props){
		//Remove a possible running tween
		if(tweensObject.hasOwnProperty(key) && tweensObject[key].isRunning ){
			this.entity.game.tweens.remove(tweensObject[key]);
		}
		//Create,add, and launch the tween
    	var targetData = LR.Utils.getPropertyByString(this.entity,key);
    	var createdTween = this.entity.game.add.tween( targetData.object );
    	//Callback handling
    	createdTween.onComplete.add(this.onTweenComplete,this);
    	targetData.object.lr_tweenName = _tweenName;
    	//
    	var newProp = {};
    	newProp[targetData.property] = props[key];
    	//process relativeness . If a tween is marked as relative, the movement on x & y will be computed from the gameobject's current position
		if( tweenData.relative == true ){
			newProp[targetData.property] += targetData.object[targetData.property];
		}
		//console.log(tweenData);
		if( tweenData.repeat < 0)
			tweenData.repeat = Number.MAX_VALUE;
    	createdTween.to(newProp, tweenData.duration, Phaser.Easing.Default, true,tweenData.delay, 
    					tweenData.repeat+(tweenData.yoyo?1:0), tweenData.yoyo);
    	//keep reference
    	tweensObject[key] = createdTween;
    	launchedTweens.push(createdTween);
    }
	return launchedTweens;
}

LR.GameObject.prototype.onTweenComplete = function(_target){
	if(_target.lr_tweenName){
		var currentTween = this.tweensData[_target.lr_tweenName];
		currentTween.count ++;
		var tweens = currentTween.tweensObject;
		var tweenData = currentTween.data;
		//Counting ( onComplete is called mutliple times for a repeating tween)
		if(tweenData.repeat > 0 && currentTween.count < Object.keys(tweens).length)
			return;
		currentTween.count = 0;
		
		//if a tween has finished, the other ones are two ( they take the same ammount of time)
		for(var key in tweens){
			if( tweens[key]!=null){
				tweens[key].stop();
				this.entity.game.tweens.remove(tweens[key]);
				tweens[key] == null;
				delete tweens[key];
			}
		}
		if( tweenData.chain != null && tweenData.chain != ""){
			this.launchTween(tweenData.chain);
		}
	}
}

LR.GameObject.prototype.stopTween = function(_tweenName){
	var tweens = this.tweensData[_tweenName].tweensObject;
	for(var key in tweens){
		tweens[key].stop();
		this.entity.game.tweens.remove(tweens[key]);
		tweens[key] == null;
		delete tweens[key];
	}
}

//============================================================
//						CUTSCENE
//============================================================
/**
* Called when a cutscene begins
*
* @method onBeginCutscene
*/
LR.GameObject.prototype.onBeginCutscene = function(){
	for(var i=0; i < this.behaviours.length; i++){
		if( this.behaviours[i].onBeginCutscene != null )
			this.behaviours[i].onBeginCutscene();
	}
}

/**
* Called when a cutscene ends
*
* @method onEndCutscene
*/
LR.GameObject.prototype.onEndCutscene = function(){
	for(var i=0; i < this.behaviours.length; i++){
		if( this.behaviours[i].onEndCutscene != null )
			this.behaviours[i].onEndCutscene();
	}
}

//============================================================
//						GLOBALS
//============================================================

/**
* Find a gameobject by its name
*
* @method <static> FindByName
* @param {Phaser.World | Phaser.Group | Phaser.Sprite} root Root of the search
* @param {string} name Gameobject's name
* @return {Phaser.World | Phaser.Group | Phaser.Sprite} Found gameobject
*/
LR.GameObject.FindByName = function(_root, _name) {
	var gameobject = null;

	if (_root && _root.go && _root.go.name === _name) {
		gameobject = _root;
	} else {
		if (_root.children) {
			var i = 0;
			while (i < _root.children.length && gameobject == null) {
				var child = _root.children[i];
				var go = LR.GameObject.FindByName(child, _name);
				if(go)
					gameobject = go;
				i++;
			}
		}
	}
	return gameobject;
};

/**
* Find a gameobject by its ID
*
* @method <static> FindByID
* @param {Phaser.World | Phaser.Group | Phaser.Sprite} root Root of the search
* @param {Number} name Gameobject's ID
* @return {Phaser.World | Phaser.Group | Phaser.Sprite} Found gameobject
*/
LR.GameObject.FindByID = function(_root, _id) {
	var gameobject = null;
	if (_root && _root.go && _root.go.id === _id) {
		gameobject = _root.go;
	} else {
		if (_root.children) {
			var i = 0;
			while (i < _root.children.length && gameobject == null) {
				var child = _root.children[i];
				var go = LR.GameObject.FindByID(child, _id);
				if (go) {
					gameobject = go;
				}

				i++;
			};
		}
	}
	return gameobject;
};
