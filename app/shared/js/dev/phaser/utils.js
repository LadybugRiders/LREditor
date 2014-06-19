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