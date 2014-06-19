"use strict";

LR.Loopy.Behaviour.InventoryManager = function(_gameobject){
	LR.Behaviour.call(this,_gameobject);
	this.coins = 0;
	this.entity.game.pollinator.on("onAddLevelCoin", this.onAddCoin,this);
}

LR.Loopy.Behaviour.InventoryManager.prototype = Object.create(LR.Behaviour.prototype);
LR.Loopy.Behaviour.InventoryManager.prototype.constructor = LR.Loopy.Behaviour.InventoryManager;

LR.Loopy.Behaviour.InventoryManager.prototype.onAddCoin = function(_data){
	this.coins += _data.ammount;
}
