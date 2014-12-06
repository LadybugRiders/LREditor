"use strict";
/**
* Holds the collision data between gameobjects in the game
* Creates collision groups according to layers
* Access instance via game.collisionManager
* 
* How to use it :
* 1) Call init method. The data asked is of this form :
*
*
* @namespace LR
* @class CollisionManager
* @param {Phaser.Game} game
* @param {Object} 
*/
var CollisionManager = function(_game, _parent){
	this.game = _game;

	/**
	* Object containing data of layers ( as the CollisionGroup for example )
	* @property layersData
	*/
	this.layersData = new Object();

	this.nbLayers = 0;

	_game.physics.p2.setPostBroadphaseCallback(this.onPostBroadphase, this);
}

/**
* Creates CollisionGroups according to the layer data
* @method init
* @param {Object} layersObjectData
*/
CollisionManager.prototype.init = function(_layersObjectData){
	if( _layersObjectData == null)
		return;
	//for each layer
	for(var key in _layersObjectData){
		//Create it
		this.addLayer(key, _layersObjectData[key].collisions);
	}
}

/**
* Adds a layer, creating a collision group
* You're advised to use the init function instead
* @method addLayer
* @param {string} layerName Name of the new layer
* @returns {number} the ID of the created layer
*/
CollisionManager.prototype.addLayer = function(_layerName, _collisionsLayers){
	if( this.layersData[_layerName] != null )
		return;

	this.layersData[_layerName] = { "id" : this.nbLayers,
									"objects" : new Array(),
									"name":_layerName,
									"group" : this.game.physics.p2.createCollisionGroup(),
									"collisionsLayers" : _collisionsLayers
								 };

	this.layersData[_layerName].group.name = _layerName;
	this.nbLayers ++;
	return this.nbLayers-1;
}

/**
* Adds an entity to the collision management of the game.
* Filtered according to its layer
* @method addGameObject
* @param {Entity} entity 
* @param {boolean} enableEvents Set to true if you want callbacks about collision events to be forwarded to the gameobject's behaviours
*/
CollisionManager.prototype.addGameObject = function(_gameobject,_enableEvents){

	_gameobject.collisionManager = this;
	//abort if the gameobject is not physical
	if( _gameobject.body == null)
		return;

	this.changeGameObjectLayer(_gameobject, _gameobject.layer, _enableEvents);
}

/**
* Changes the GameObject collisions groups accroding to the specified layer
* @method changeGameObjectLayer
* @param {GameObject} gameobject 
* @param {string} layer Name of the new layer (check PhysicsSettings)
*/
CollisionManager.prototype.changeGameObjectLayer = function(_gameobject, _layer , _enableEvents){
	_gameobject.collisionManager = this;	
	_gameobject.layer = _layer;
	//abort if the gameobject is not physical
	if( _gameobject.body == null)
		return;
	var layerData = this.getLayerData(_layer);
	if(layerData == null){
		console.error("Layer " + _layer + " doesnt exists.");
		return;
	}
	//clear collisions on the body
	_gameobject.body.clearCollision(true,true);
	//  Sets the collision group of the body
    _gameobject.body.setCollisionGroup(layerData.group);

    //Get Names of layers that can collide with the gameobject 
    var collisions = layerData.collisionsLayers;	
    // Tells body to collide with layers enabled
    var collGroups = new Array();
    for(var i=0; i < collisions.length; i++){
    	//Get collidable layer collisionGroup
    	var group = this.getLayerData(collisions[i]).group;
    	if( group != null)
    		collGroups.push(group);
    }
    _gameobject.body.collides(collGroups);
	
    //let's enable events contact callbacks
	if( _enableEvents == true){
		_gameobject.enableEvents();
	}
}

//==================================================================
//				 	POST BROADPHASE
//==================================================================
/**
* Called before allowing collision between two bodies. By returning true, you allow a collision to happen.
* This is called for a pair
* ie if onPostBroadphase( player , enemy1) is called, onPostBroadphase( enemy1, player) won't be called
*
* If you want to be able to process this phase, use setPostBroadPhaseCallback(callback,context) on your GameObject
*
* @method onPostBroadphase
* @param {Phaser.P2.Body} body1
* @param {Phaser.P2.Body} body2
*/
CollisionManager.prototype.onPostBroadphase = function(_body1,_body2){
	var result = true;
	//check gameobject broadphases callbacks
	if( _body1.sprite && _body1.sprite.go && _body1.sprite.go.broadphaseListened)
		result = result & _body1.sprite.go.onPostBroadPhase(_body2);
	if( _body2.sprite && _body2.sprite.go && _body2.sprite.go.broadphaseListened)
		result = result & _body2.sprite.go.onPostBroadPhase(_body1);
	return result;
}

//==================================================================
//						CLEAR
//==================================================================

CollisionManager.prototype.clear = function(){	
	this.layersData = new Object();
	this.nbLayers = 0;
}

//==================================================================
//						GETTERS
//==================================================================

/**
* Returns the collision data for the specified layer
* @method getLayerData
* @param {string} layer Name of the layer
*/
CollisionManager.prototype.getLayerData = function(_layer){
	return this.layersData[ _layer ];
}
