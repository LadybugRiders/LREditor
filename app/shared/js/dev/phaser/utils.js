"use strict";

LR.Utils = function(){

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
LR.Utils.RemoveFromArray = function(_object,_array){
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
* @param {Phaser.Point} point
* @param {Number} angle In degrees. Positive angle go counter-clokwise
* @return Phaser.Point
*/
LR.Utils.rotatePoint = function(_point,_angle){
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
