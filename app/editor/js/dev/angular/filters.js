'use strict';

/* Filters */

var moduleFilters = angular.module('LREditor.filters', []);

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

moduleFilters.filter('noeditorentities', [function() {
	return function(items) {
		var array = new Array();
		for (var i = (items.length - 1); i >= 0; i--) {
			var item = items[i];
			if (item.name) {
				if (item.name != "__world") {
					if ((item.name[0] == "_" && item.name[0] == "_") == false) {
						array.push(item);
					}
				} else {
					array.push(item);
				}
			} else {
				array.push(item);
			}
		};
		return array;
	};
}]);