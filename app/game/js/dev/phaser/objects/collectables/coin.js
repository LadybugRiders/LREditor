"use strict";

/**
* Coin. Attach a Collectable behaviour to make it collectable.
* Calls onAddLevelCoin onto Pollinator if collected
*
* @class Coin
* @constructor
*/
LR.Loopy.Behaviour.Coin = function(_gameobject){
	LR.Behaviour.call(this,_gameobject);
	this.ammount = 5;
}

LR.Loopy.Behaviour.Coin.prototype = Object.create(LR.Behaviour.prototype);
LR.Loopy.Behaviour.Coin.prototype.constructor = LR.Loopy.Behaviour.Coin;

LR.Loopy.Behaviour.Coin.prototype.collect = function(){
	//Dispatch the event of Coin collecting
	this.go.game.pollinator.dispatch("onAddLevelCoin",{ammount:this.ammount});
	this.entity.kill();
}

LR.Loopy.Behaviour.Coin.prototype.destroy = function(){
	
}