"use strict";

LR.Editor.Settings = function(){

};

LR.Editor.Settings.project = {
	path: "/game",
	playUrl: "/game",
};

LR.Editor.Settings.keysData = {
	"valid" : { key : Phaser.Keyboard.SPACEBAR, capture : false },
	"ctrl" : { key :Phaser.Keyboard.CONTROL, capture : false },
	"alt" : { key :Phaser.Keyboard.ALT, capture : true },
	"C" : { key :Phaser.Keyboard.C, capture : false }
};