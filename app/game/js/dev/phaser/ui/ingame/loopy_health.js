"use strict";

/**
* [Behaviour]
* Attach this to the coin UI. This will create a text at its right.
* It binds itself to the onAddLevelCoin of Pollinator. 
*
* @class UILevelCoinsCount 
* @constructor
*/
LR.Loopy.Behaviour.UI.LoopyHealth = function(_gameobject){
	LR.Behaviour.call(this,_gameobject);

}

LR.Loopy.Behaviour.UI.LoopyHealth.prototype = Object.create(LR.Behaviour.prototype);
LR.Loopy.Behaviour.UI.LoopyHealth.prototype.constructor = LR.Loopy.Behaviour.LoopyHealth;

LR.Loopy.Behaviour.UI.LoopyHealth.prototype.destroy = function(){
}