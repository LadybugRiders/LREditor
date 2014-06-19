'use strict';

/* Filters */

var moduleFilters = angular.module('Loopy.filters', []);

moduleFilters.filter('interpolate', ['version', function(version) {
	return function(text) {
  		return String(text).replace(/\%VERSION\%/mg, version);
	}
}]);

moduleFilters.filter('reverse', [function() {
	return function(items) {
		var array = new Array();
		if (items && items.slice ) {
			array = items.slice().reverse();
		}

		return array;
	};
}]);

moduleFilters.filter('groups', [function() {
	return function(items) {
		var array = new Array();
		if (items) {
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item instanceof Phaser.Group) {
					array.push(item);
				}
			};
		}
		
		return array;
	};
}]);

moduleFilters.filter('gameobjects', [function() {
	return function(items) {
		var array = new Array();
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			if (item instanceof GameObject) {
				array.push(item);
			}
		};
		return array;
	};
}]);