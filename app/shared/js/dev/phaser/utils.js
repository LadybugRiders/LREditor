"use strict";
/**
* Misc Utilities
*
* @namespace LR
* @class Utils
* @constructor
*/
LR.Utils = function(){

}

LR.Utils.RIGHT = "right";
LR.Utils.LEFT = "left";
LR.Utils.TOP = "top";
LR.Utils.BOTTOM = "bottom";

/**
* Adds as many _char as _width
* example : pad(45,4,"0") = "0045"
* The char by default is "0"
*
* @method pad
* @param {number|string} number : number or string to pad
* @param {number} width : final length of the returned string
* @param {string|char} char : char or string to add to fill the resulting string
*/
LR.Utils.pad = function(_number, _width, _char) {
  _char = _char || '0';
  _number = _number + '';
  return _number.length >= _width ? _number : new Array(_width - _number.length + 1).join(_char) + _number;
}

/**
* Remove an object from the specified array and return it
*
* @namespace LR
* @method removeFromArray
* @param {Object} object Object to be removed
* @param {Array} array The array containing the object
* @return null if not found
*/
LR.Utils.removeFromArray = function(_object,_array){
	var found = false;
	var i;
	for( i=0; i < _array.length; i++){
		//if the callback & context are the same
		if( _array[i] === _object ){
			//this is the object we are looking for
			found = true;
			break;
		}
	}
	if( found ){
		var objectRemoved = _array[i];
		_array.splice(i,1);
		return objectRemoved;
	}
	return null;
}

/**
* Converts from degrees to radians.
*
* @method toRadians
* @param {Number} angle in degrees
*/
LR.Utils.toRadians = function(_degrees) {
  return _degrees * Math.PI / 180;
};
 
/**
* Converts from radians to degrees.
*
* @method toDegrees
* @param {Number} angle in radians
*/
LR.Utils.toDegrees = function(_radians) {
  return _radians * 180 / Math.PI;
};

/**
* Rotates a point with the given angle (in degrees)
*
* @method rotatePoint
* @param {Phaser.Point} point If null, default value is (1,0)
* @param {Number} angle In degrees. Positive angle go counter-clokwise
* @return Phaser.Point
*/
LR.Utils.rotatePoint = function(_point,_angle){
	if( _point == null ) _point = new Phaser.Point(1,0);
	_angle = _angle * Math.PI / 180;
   var point= new Phaser.Point();
   point.x = _point.x*Math.cos(_angle) - _point.y*Math.sin(_angle);
   point.y = _point.x*Math.sin(_angle) + _point.y*Math.cos(_angle);
   return point;
}

/**
* Rotates a point with the given angle (in degrees) around the specified anchor point
*
* @method rotatePointAround
* @param {Phaser.Point} point
* @param {Number} angle In degrees. Positive angle go counter-clokwise
* @param {Phaser.Point} anchor The anchor point to rotate around
* @return Phaser.Point
*/
LR.Utils.rotatePointAround = function(_point,_angle,_anchor){
	_angle = _angle * Math.PI / 180;
   //translate the point to rotate it around origin (0,0)
   var tPoint= new Phaser.Point(_point.x - _anchor.x, _point.y - _anchor.y);
   var newPoint = new Phaser.Point();
   newPoint.x = tPoint.x*Math.cos(_angle) - tPoint.y*Math.sin(_angle);
   newPoint.y = tPoint.x*Math.sin(_angle) + tPoint.y*Math.cos(_angle);
   //Translate back to the anchor
   newPoint.x += _anchor.x;
   newPoint.y += _anchor.y;

   return newPoint;
}

/**
* Compute angle between two points / vectors
*
* @method angle
* @param {Phaser.Point} pointA
* @param {Phaser.Point} pointB
*/
LR.Utils.angle = function(_pointA, _pointB){
	var a = _pointA.normalize();
	var b = _pointB.normalize();

	var dot = a.x * b.x + a.y * b.y;
	return Math.acos(dot) * 180 / Math.PI;
}


/**
* This function returns the object's property defined by a complex string
* ie : if string = "body.x"
* the object value will be the body property of the object
* If a property is not found, the object is returned as itself
* example of returned object :
* { object : instanceof P2.Body , property : "x"}
* you can then access your property : object[property]
*/
LR.Utils.getPropertyByString = function( _object, _string){
	var returnObject = { "object" : _object, "property" : _string};
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

	returnObject.object = currentProp; // the target is the property we found
	returnObject.property = arrayProp[arrayProp.length-1]; // the tweened property is the last in the array
	
	return returnObject;
}

/**
* Returns an object containing the sides of the shapes 
* properties of the object : left, right, top, bottom 
* in the world coordinates
*
* @method getRectShapeSides
* @param {GameObject} go
* @parma {P2.Shape} shape
*/
LR.Utils.getRectShapeSides = function(_go,_shape){
	var data = _go.getShapeData(_shape.lr_name);
	var p2 = _go.entity.game.physics.p2;

	//Rotate shape offset with the body, as offset isnt changed with rotations
	var realOffset = new Phaser.Point(data.x,data.y); 
	realOffset = LR.Utils.rotatePoint(realOffset, _go.entity.body.angle);
	data.x = realOffset.x;
	data.y = realOffset.y;

	//Compute bounds of the shape
	var bounds = new Object();
	bounds.left = _go.entity.world.x + p2.mpx(_shape.centerOfMass[0]);
	bounds.right = _go.entity.world.x + p2.mpx(_shape.centerOfMass[0]) + p2.mpx(_shape.width)
	bounds.top = _go.entity.world.y + p2.mpx(_shape.centerOfMass[1]);
	bounds.bottom = _go.entity.world.y + p2.mpx(_shape.centerOfMass[1]) + p2.mpx(_shape.height);

	return bounds;
}

/**
* Returns true if the sprite is visible by the camera
*
* @method isSpriteInCameraView
* @param {LR.Entity.Sprite} sprite The sprite
* @param {Camera} camera The active camera
*/
LR.Utils.isSpriteInCameraView = function(_sprite,_camera){
	var rect = new Phaser.Rectangle(
							_sprite.world.x - Math.abs(_sprite.width) * 0.5 * _sprite.scale.x ,
							_sprite.world.y - Math.abs(_sprite.height) * 0.5 * _sprite.scale.y, 
							Math.abs(_sprite.width * _sprite.scale.x),
							Math.abs(_sprite.height * _sprite.scale.y)
				);

	var inCam = _camera.view.intersects(rect);
	
	return inCam;
}

//==========================================================
//					COLLISION / SHAPES
//==========================================================

/**
* Returns the side of the collision between two gameobject's shapes 
* returned data can be compared with :
* LR.Utils.RIGHT | LR.Utils.LEFT | LR.Utils.TOP | LR.Utils.BOTTOM 
*
* @method getCollisionSide
* @param {LR.GameObject} gameobject1 The first gameobject
* @param {Shape} shape1 The first shape
* @param {LR.GameObject} gameobject2 The second gameobject
* @param {Shape} shape2 The second shape
* @return integer
*/
LR.Utils.getCollisionSide = function(_go1,_shape1,_go2,_shape2){
	var firstShapeType = LR.Utils.getShapeType(_shape1);
	var secondShapeType = LR.Utils.getShapeType(_shape2);
	if(firstShapeType == "rectangle" && secondShapeType == "rectangle" ){
		return LR.Utils.getRectCollisionSide(_go1,_shape1,_go2,_shape2);
	}else if(firstShapeType == "circle" || secondShapeType == "circle"){
		return LR.Utils.getCircleCollisionSide(_go1,_shape1,_go2,_shape2);
	}
	return null;
}

/**
* Returns the side of the collision between two gameobject with a rectangle shape
* returned data can be compared with :
* LR.Utils.RIGHT | LR.Utils.LEFT | LR.Utils.TOP | LR.Utils.BOTTOM 
*
* @method getRectCollisionSide
* @param {LR.GameObject} gameobject1 The first gameobject
* @param {Shape} shape1 The first rectangle shape
* @param {LR.GameObject} gameobject2 The second gameobject
* @param {Shape} shape2 The second rectangle shape
* @return integer
*/
LR.Utils.getRectCollisionSide = function(_go1,_rect1,_go2,_rect2){

	var p2 = _go1.game.physics.p2;

	var w = 0.5 * p2.mpx(_rect1.width + _rect2.width);
	var h = 0.5 * p2.mpx(_rect1.height + _rect2.height);
	
	var center1 = new Phaser.Point(_go1.entity.world.x + p2.mpx(_rect1.centerOfMass[0]) ,
									_go1.entity.world.y + p2.mpx(_rect1.centerOfMass[1]));

	var center2 = new Phaser.Point(_go2.entity.world.x + p2.mpx(_rect2.centerOfMass[0]) ,
									_go2.entity.world.y + p2.mpx(_rect2.centerOfMass[1]));
	var dx = center1.x - center2.x;
	var dy = center1.y - center2.y;

    var wy = w * dy;
    var hx = h * dx;

    if (wy > hx){
        if (wy > -hx){
        	return LR.Utils.TOP;
        }else{
            return LR.Utils.RIGHT;
        }
    }else{
        if (wy > -hx){
        	return LR.Utils.LEFT;
        }else{
            return LR.Utils.BOTTOM;
        }
    }
	return -1;
}

/**
* Returns the side of the collision between two gameobject whose one is a circle shape
* returned data can be compared with :
* LR.Utils.RIGHT | LR.Utils.LEFT | LR.Utils.TOP | LR.Utils.BOTTOM 
*
* @method getCircleCollisionSide
* @param {LR.GameObject} gameobject1 The first gameobject
* @param {Shape} shape1 The first shape
* @param {LR.GameObject} gameobject2 The second gameobject
* @param {Shape} shape2 The second shape
* @return integer
*/
LR.Utils.getCircleCollisionSide = function(_go1,_shape1,_go2,_shape2){
	var pos1 = new Phaser.Point( _go1.entity.body.worldX, _go1.entity.body.worldY);
	var pos2 = new Phaser.Point( _go2.entity.body.worldX, _go2.entity.body.worldY);

	var angle = Phaser.Math.angleBetweenPoints(pos1,pos2);
	angle = Phaser.Math.radToDeg(angle);
	if(angle < 45 && angle >= -45)
		return LR.Utils.RIGHT;
	if(angle < -45 && angle >= -135)
		return LR.Utils.TOP;
	if(angle < -135 && angle >= -225)
		return LR.Utils.LEFT;
	return LR.Utils.BOTTOM;
}

LR.Utils.getShapeType = function(_shape){
	switch(_shape.type){
		case 32 : return "rectangle";
		case 1 : return "circle";
	}
	return "";
}