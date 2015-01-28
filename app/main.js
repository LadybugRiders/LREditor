"use strict";

window.onload = function() {
    // the phaser div takes all space
    expandPhaserElement();

	//last parameter == debug
	var game = new KRGame("phaser", 640, 320,Phaser.ScaleManager.SHOW_ALL,true);
}

var KRGame = function(_containerId, _width, _height, _scaleMode, _debug) {
    LR.Game.call(this, _containerId, _width, _height, _scaleMode, _debug);
};

KRGame.prototype = Object.create(LR.Game.prototype);
KRGame.prototype.constructor = KRGame;

KRGame.prototype.preload = function() {
    LR.Game.prototype.preload.call(this);
}

window.addEventListener("resize", expandPhaserElement);

function expandPhaserElement() {
    var phaserDiv = document.getElementById("phaser");
    if (phaserDiv) {
        var style = window.getComputedStyle(phaserDiv, null);
        var height = parseInt(style.height);

        phaserDiv.style.width = window.innerWidth + "px";
        phaserDiv.style.height = window.innerHeight + "px";
    }
}