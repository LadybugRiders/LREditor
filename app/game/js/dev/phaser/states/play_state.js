"use strict";

var PLAYER;
var BG;

var PlayState = function(_game) {
	LR.State.call(this, _game);
	_game.state.add("Play", this, false);
};

PlayState.prototype = Object.create(LR.State.prototype);
PlayState.prototype.constructor = PlayState;

PlayState.prototype.preload = function(){

}

PlayState.prototype.create = function(){
	//this has to be done since 2.0.3 is not working well with inputs
	this.game.inputManager.init(InputSettings.keys);

    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.collisionManager = new CollisionManager(this.game);
    this.collisionManager.init(PhysicsSettings.LAYERS);

	this.game.physics.p2.gravity.y = PhysicsSettings.GLOBAL_GRAVITY;

	//init inventory for the currentlevel
	var inventory = new LR.Entity.Sprite(this.game, 0 ,0 ,"", "inventory");
	var inventoryScript = inventory.go.addBehaviour( new LR.Loopy.Behaviour.InventoryManager(inventory.go) );

	//Bg
	BG = this.game.add.tileSprite(0, 0, 780, 486, 'background');
	BG.fixedToCamera = true;
	BG.x = this.game.camera.x;
	BG.y = this.game.camera.y;

	//PLAYER
	PLAYER = new LR.Entity.Sprite(this.game,-100,100,"loopy").go;	
	PLAYER.debugBounds = true;
	var playerCtrl = new LR.Loopy.Behaviour.PlayerRunnerController(PLAYER);
	PLAYER.addBehaviour(playerCtrl);
	PLAYER.layer ="player";
	//Weapon
	var weaponObj = new LR.Entity.Sprite(this.game,0,0,"","fork").go;
	var weaponScript = new LR.Loopy.Behaviour.Weapon(weaponObj);
	weaponObj.addBehaviour(weaponScript);
	weaponObj.layer = "player";
	weaponScript.setOwner(PLAYER);

	playerCtrl.weapon = weaponScript;

	// Add player to collisions and enable callbacks
    this.addGameObjectFull(PLAYER);   
    this.addGameObjectFull(weaponObj);

	//obstacles
	this.createObstacles();
	this.createCoins();
	//TriggerDeath
	var triggerDeath = new LR.Entity.Sprite(this.game,0,320,"","triggerDeath").go;
	triggerDeath.layer = "death";
	//physics
	triggerDeath.enablePhysics(PhysicsSettings.STATIC);
	triggerDeath.enableSensor();
	triggerDeath.body.setRectangle( 17000, 10);	
	//behaviours
	var trigDeath = triggerDeath.addBehaviour( new LR.Behaviour.Trigger(triggerDeath) );
	trigDeath.create({ callbackName : "die", interactives : ["player"], 
						messageObject: { typeDeath : "fall"}
						});
	// Add trigger
    this.addGameObjectFull(triggerDeath);  

    //ENEMIES
    var enemyObj = new LR.Entity.Sprite(this.game,600,-500,"goomba","goomba2").go;
    enemyObj.layer = "enemy";
    enemyObj.addBehaviour( new LR.Loopy.Behaviour.Enemy(enemyObj));
    this.addGameObjectFull(enemyObj);

    //MENU
    this.createMenu(inventoryScript);

	//CAMERA
	this.game.camera.bounds = null;
	this.game.camera.follow(PLAYER.entity);
}

PlayState.prototype.update = function(){
	BG.tilePosition.x += PLAYER.body.velocity.x * 0.1;
}

//===============================================================
//						OBSTACLES
//===============================================================
PlayState.prototype.createObstacles = function(){
	//Create a group for obstacles and enable the body
	this.obstacles = this.game.add.group();
    this.obstacles.enableBody = true;
    this.obstacles.physicsBodyType = Phaser.Physics.P2JS;
    //Create First Ground
	var obstacle;
	obstacle = this.createGround(100,300,1700,200,"groundA");

	//create wall right
	obstacle = this.createGround(500,100,300,300,"wallRight");
	obstacle = this.createGround(160,-30,50,200,"wallLeft");

	//create trigger Left
	obstacle = this.createGround(-200,0,100,300,"triggerDir1");
	obstacle.layer = "trigger_player";
	obstacle.enableSensor();
	obstacle.disableDebugBounds();
	var triggerDir = obstacle.addBehaviour(new LR.Behaviour.Trigger(obstacle));
	triggerDir.create({ callbackName : "changeDirection", interactives : ["player"], 
						messageObject: { direction : 1}
						} );


	//create trigger end level
	obstacle = this.createGround(910,160,50,50,"triggerEnd");
	obstacle.enableSensor();
	obstacle.layer = "trigger_player";
	obstacle.disableDebugBounds();
	var triggerScript = obstacle.addBehaviour(new LR.Behaviour.Trigger(obstacle));
	triggerScript.create({ callbackName : "win", interactives : ["player"]	});
}

PlayState.prototype.createGround = function(_x,_y,_width,_height,_name){
	var obstacle;
	obstacle = new LR.Entity.Sprite(this.game,_x,_y,"",_name).go;
	obstacle.enablePhysics(PhysicsSettings.STATIC,"ground",_width,_height);
	obstacle.enableDebugBounds();
	this.addGameObject(obstacle,false); 
	this.obstacles.add(obstacle.entity);
	return obstacle;
}


//===============================================================
//						COINS
//==============================================================

PlayState.prototype.createCoins = function(){
	this.coins = this.game.add.group();
    this.coins.enableBody = true;
    this.coins.physicsBodyType = Phaser.Physics.P2JS;

	var coin = this.createCoin(300,-200);
}

PlayState.prototype.createCoin = function(_x,_y){
	var coin = new LR.Entity.Sprite(this.game,_x,_y,"coin","Coin").go;
	var collectScript = new LR.Loopy.Behaviour.Collectable(coin);
	coin.addBehaviour(collectScript);
	coin.addBehaviour( new LR.Loopy.Behaviour.Coin(coin) );
	coin.layer = "item"
	this.coins.add(coin.entity);
	this.addGameObject(coin,false,true);
	return coin;
}


//===============================================================
//						MENU IN GAME
//==============================================================

PlayState.prototype.createMenu = function(_inventory){
	var group = this.game.add.group();
	//TOP RIGTH == coin
	var coin = new LR.Entity.Sprite(this.game,530, 24, "coin", "menu_coin");
	coin.fixedToCamera = true;
	coin.alpha = 0.8;
	group.add(coin);
	this.addGameObject(coin.go,false);
	//cointText
	var coinText = new LR.Entity.Text(this.game,this.game.width,0,"0",
									LR.Loopy.FontsSettings.CoinStyle, //style
									"LifeText");
	//coinText.go.addBehaviour(new LR.Loopy.Behaviour.UI.LevelCoinsCount(coinText.go));
	coinText.anchor.setTo(1,0);
	coinText.numberPadding = 2;
	coinText.bindToVariable("coins",_inventory,"x");
	group.add(coinText);
	this.addGameObject(coinText.go,false);
}