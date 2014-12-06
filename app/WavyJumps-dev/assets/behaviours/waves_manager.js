"use strict";
//>>LREditor.Behaviour.name: WavesManager
//>>LREditor.Behaviour.params : {}
var WavesManager = function(_gameobject) {	
	LR.Behaviour.call(this,_gameobject);
};

WavesManager.prototype = Object.create(LR.Behaviour.prototype);
WavesManager.prototype.constructor = WavesManager;

WavesManager.prototype.create = function( _data ){
    this.nbWavesAtStart = 1;

    this.graphics = this.go.game.add.graphics(0, 0);

    this.waves = new Array();
    this.inactiveWaves = new Array();

    for (var i = 0; i < this.nbWavesAtStart; i++) {
        this.waves.push(new Wave(this));
    };

    this.timer = 0;
    this.step = 5000; // 10s before adding a new wave
};

WavesManager.prototype.start = function(){  
};

WavesManager.prototype.update = function() {

    var dt = this.go.game.time.elapsed;

    this.graphics.clear();
    this.inactiveWaves = new Array();

    for (var i=0; i<this.waves.length; ++i) {
        var wave = this.waves[i];

        wave.update(dt);

        if (!wave.active) {
            this.inactiveWaves.push(wave);
        }
    }

    // check collisions with the player

    // replace all inactive waves
    for (var i=0; i<this.inactiveWaves.length; ++i) {
        var wave = this.inactiveWaves[i];
        wave.reset();
    }

    // add a wave if necessary
    this.timer += dt;
    if (this.timer >= this.step) {
        this.waves.push(new Wave(this));

        this.timer = 0;
    }

    // draw waves
    for (var i=0; i<this.waves.length; ++i) {
        this.waves[i].render(this.graphics);
    }
};

//////////
// WAVE //
//////////

var Wave = function(_manager) {
    this.manager = _manager;
    var game = this.manager.go.game;
    var halfWidth = game.camera.width * 0.5;

    this.radiusMin = 10;
    this.radiusMax = halfWidth;

    this.lineWidthMin = 4;
    this.lineWidthMax = 10;

    this.alphaMin = 0;
    this.alphaMax = 1;

    this.speedMin = 0.05;
    this.speedMax = 0.10;
    
    this.reset();
};

Wave.prototype.reset = function() {
    var game = this.manager.go.game;
    var halfWidth = game.camera.width * 0.5;
    var halfHeight = game.camera.height * 0.5;

    // set position
    this.x = game.rnd.integerInRange(-halfWidth, halfWidth);
    this.y = game.rnd.integerInRange(-halfHeight, halfHeight);

    // set type
    if (game.rnd.realInRange(0, 1) < 0.5) {
        this.type = 0;
    } else {
        this.type = 1;
    }

    // set line width
    this.lineWidth = this.lineWidthMin;

    // set alpha
    this.alpha = this.alphaMax;

    //set speed
    this.speed = (this.speedMax + this.speedMin) * 0.5;

    // adjust radius, speed and color depending on type
    if (this.type == 0) {
        this.radius = this.radiusMin;
        this.color = 0xd36705;
    } else {
        this.radius = this.radiusMax;
        this.speed *= -1;
        this.color = 0x33a3c1;
    }

    // set active
    this.active = true;
}

Wave.prototype.update = function(_dt) {
    if (this.active) {
        this.radius += this.speed * _dt;

        if (this.radius <= this.radiusMin) {
            this.radius = this.radiusMin;
            this.active = false;
        } else {
            if (this.radius >= this.radiusMax) {
                this.radius = this.radiusMax;
                this.active = false;
            }
        }
    }
};

Wave.prototype.render = function(_graphics) {
    _graphics.lineStyle(this.lineWidth, this.color, this.alpha);
    
    // draw a shape
    _graphics.drawCircle(this.x, this.y, this.radius);
};



