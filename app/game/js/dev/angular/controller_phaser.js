"use strict";

// get module Loopy.controllers
var loopyCtrlMod = angular.module('Loopy.controllers');

var PLAYER;

// create controller LoginCtrol in the module Loopy.controllers
loopyCtrlMod.controller('PhaserCtrl', ["$scope", "$http", "$routeParams", function($scope, $http, $routeParams) {
	function main() {
		$scope.game = new GameCore($scope, $http, $routeParams);
	};

	main();
}]);