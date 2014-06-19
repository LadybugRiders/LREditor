"use strict";

var GameCore = function($scope, $http, $routeParams) {

	this.$scope = $scope;
	this.$http = $http;
	this.$routeParams = $routeParams;
	
	var preload = function(_game) {
	};

	var create = function() {

		$scope.game.plugins.add(Phaser.Plugin.InputManager);
		$scope.game.plugins.add(Phaser.Plugin.CutsceneManager);
		$scope.game.plugins.add(Phaser.Plugin.DialogManager);

		var bootstate = new LR.Loopy.State.BootState(this);
		var loadstate = new LR.Loopy.State.LoadingState(this);
		var selectstate = new LR.Loopy.State.SelectionMenuState(this);
		var playstate = new LR.Loopy.State.PlayState(this);
		var levelstate = new LR.Loopy.State.LevelState(this);

		$scope.game.state.start("Boot");
	};

	var update = function() {
	};

	var render = function() {

	};

	var functions = {
		preload: preload,
		create: create,
		update: update,
		render: render
	};

	Phaser.Game.call(this,640, 360, Phaser.AUTO, 'phaser',functions);
}

GameCore.prototype = Object.create(Phaser.Game.prototype);
GameCore.prototype.constructor = GameCore;

