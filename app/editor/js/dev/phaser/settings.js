"use strict";

LR.Editor.Settings = function(){

};

LR.Editor.Settings.project = {
	path: "app/game/wildrush/public",
	playUrl: "/game/wildrush/public",
};

LR.Editor.Settings.keysData = {
	"valid" : { key : Phaser.Keyboard.SPACEBAR, capture : false },
	"ctrl" : { key :Phaser.Keyboard.CONTROL, capture : false },
	"alt" : { key :Phaser.Keyboard.ALT, capture : true },
	"C" : { key :Phaser.Keyboard.C, capture : false }
};