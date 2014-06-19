"use strict";

LR.Loopy.State.SelectionMenuState = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("SelectionMenu", this, false);
};

LR.Loopy.State.SelectionMenuState.prototype = Object.create(LR.State.prototype);
LR.Loopy.State.SelectionMenuState.prototype.constructor = LR.Loopy.State.SelectionMenuState;

LR.Loopy.State.SelectionMenuState.prototype.preload = function() {
	this.game.load.spritesheet('levels_sheet', 'assets/images/menus/main/levels.png', 90, 90 , 6);	
}

LR.Loopy.State.SelectionMenuState.prototype.create = function(){
	this.playButtons = new Array();	

	this.playButtons.push( this.game.add.button(200,100, 'levels_sheet', this.onClick1,
						this, 1, 0, 1) );
	this.playButtons.push( this.game.add.button(300,100, 'levels_sheet', this.onClick2,
						this, 3, 2, 3) );
	this.playButtons.push( this.game.add.button(400,100, 'levels_sheet', this.onClick3,
						this, 5, 4, 5) );


	this.game.add.button(-50,-50, 'levels_sheet', function() {this.game.state.start("Play")},
						this, 5, 4, 5).alpha = 0.5;
	
}

LR.Loopy.State.SelectionMenuState.prototype.onClick1 = function() {
	this.game.state.start("Level", true, false, {levelName: "level1"});
}

LR.Loopy.State.SelectionMenuState.prototype.onClick2 = function() {
	this.game.state.start("Level", true, false, {levelName: "level2"});
}

LR.Loopy.State.SelectionMenuState.prototype.onClick3 = function() {
	this.game.state.start("Level", true, false, {levelName: "level3"});
}