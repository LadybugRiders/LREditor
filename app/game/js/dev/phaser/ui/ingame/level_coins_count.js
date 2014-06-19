"use strict";

/**
* Attach this to the coin UI Text
* It binds itself to the onAddLevelCoin of Pollinator. 
*
* @class LevelCoinsCount 
* @constructor
*/
LR.Loopy.Behaviour.UI.LevelCoinsCount = function(_gameobject){
	LR.Behaviour.call(this,_gameobject);
	this.entity.fixedToCamera = true;

	this.coins = 0;

	//binds to pollinator
	this.go.game.pollinator.on("onAddLevelCoin", this.onAddCoin, this);

	//creates a text at the right of the ui coin
	var style = { font: "35px Arial", fill: "#ffffff", align: "left" };
    this.entity.setStyle( style );
    this.entity.alpha = 0.7;
}

LR.Loopy.Behaviour.UI.LevelCoinsCount.prototype = Object.create(LR.Behaviour.prototype);
LR.Loopy.Behaviour.UI.LevelCoinsCount.prototype.constructor = LR.Loopy.Behaviour.LevelCoinsCount;

/**
* Called when onAddLevelCoin is called onto Pollinator by an ingame coin
*
* @method onAddCoin
*/
LR.Loopy.Behaviour.UI.LevelCoinsCount.prototype.onAddCoin = function(_data){
	this.coins += _data.ammount;
	this.entity.text = "x"+ ( this.coins < 10 ? "0":"" ) + this.coins;
}

LR.Loopy.Behaviour.UI.LevelCoinsCount.prototype.destroy = function(){
	//Behaviour.prototype.destroy.call(this);
	this.go.game.pollinator.off("onAddLevelCoin", this.onAddCoin, this);	
}