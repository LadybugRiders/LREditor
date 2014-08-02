"use strict";

LR.Editor.Settings = function(){

};

LR.Editor.Settings.project = {
	path: "/game",
	playUrl: "/game",
};

LR.Editor.Settings.keysData = {
	"valid" : { key : Phaser.Keyboard.SPACEBAR, capture : true },
	"ctrl" : { key :Phaser.Keyboard.CONTROL, capture : true },
	"alt" : { key :Phaser.Keyboard.ALT, capture : false },
	"del" : { key :Phaser.Keyboard.DELETE, capture : false },
	"clone" : { key :Phaser.Keyboard.C, capture : false},
	"scale" : { key : Phaser.Keyboard.S, capture : false },
	"rotate" : { key : Phaser.Keyboard.R, capture : false }
};