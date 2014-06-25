'use strict';

/* Directives */

var moduleDirectives = angular.module('LREditor.directives', []);

moduleDirectives.directive('appVersion', ['version', function(version) {
	return function(scope, elm, attrs) {
		elm.text(version);
	};
}]);

var INTEGER_REGEXP = /^\-?\d+$/;
moduleDirectives.directive('integer', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				if (INTEGER_REGEXP.test(viewValue)) {
					// it is valid
					ctrl.$setValidity('integer', true);
					return viewValue;
				} else {
					// it is invalid, return undefined (no model update)
					ctrl.$setValidity('integer', false);
					return 0;
				}
			});
		}
	};
});

var FLOAT_REGEXP = /^\-?\d+((\.|\,)\d+)?$/;
moduleDirectives.directive('float', function() {
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function(viewValue) {
				if (FLOAT_REGEXP.test(viewValue)) {
					ctrl.$setValidity('float', true);
					return parseFloat(viewValue.replace(',', '.'));
				} else {
					ctrl.$setValidity('float', false);
					return 0;
				}
			});
		}
	};
});

moduleDirectives.directive('accordionDraggable', function() {
	function link(_scope, _element, _attrs) {
		var element = _element;
		if (element.length > 0) element = element[0];

		var panelHeading = $(element).find(".panel-heading")[0];
		$(panelHeading).on("mousedown", function(_event) {
			_scope.accordionDraggableMouseDown = true;
		});
		$(panelHeading).on("mouseup", function(_event) {
			_scope.accordionDraggableMouseDown = false;
		});

		$(panelHeading).on("mousemove", function(_event) {
			if (_scope.accordionDraggableMouseDown == true) {
				var target = $(_event.target);
				if (target.length > 0) target = target[0];

				if (target.localName != "a") {
					var parent = $(_element).parent();

					var width = parent.width();
					var height = parent.height();

					var x = Math.round(_event.pageX - width * 0.5);
					if (x < 0) x = 0;
					if (x + width > window.innerWidth)
						x = window.innerWidth - width;

					var y = Math.round(_event.pageY - 15);
					if (y < 0) y = 0;
					if (y + height > window.innerHeight)
						y = window.innerHeight - height;

					parent.css("left", x + "px");
					parent.css("top", y + "px");
				}
			}
		});
	}

	return {
		link: link
	};
});

moduleDirectives.directive('entityCollapse', function() {
	function link(_scope, _element, _attrs) {
		_element.click(function() {
			var ul = _element.parent().next("ul");
			if (ul.css("display") === "none") {
				ul.css("display", "block");
				_element.children("span").attr(
					"class", "glyphicon glyphicon-chevron-down"
				);
			} else {
				ul.css("display", "none");
				_element.children("span").attr(
					"class", "glyphicon glyphicon-chevron-right"
				);
			}
		});
	};

	return {
		link: link
	};
});

moduleDirectives.directive('entityDrag', function() {
	function link(_scope, _element, _attrs) {

		_scope.main = function(_scope, _element, _attrs) {
			var isGroup = _scope.isGroup(_scope.entity);

			_element.attr("draggable" , true);
			_element.on({dragstart: _scope.drag});
			// only group can have children
			if (isGroup) {
				_element.on({
					drop: _scope.drop,
					dragover: _scope.dragOver,
					dragenter: _scope.dragEnter,
					dragleave: _scope.dragLeave
				});
			}
		};

		_scope.dragOver = function(ev) {
	  	ev.preventDefault();
		};

		_scope.dragEnter = function(ev) {
			_scope.addBorder($(ev.target));
		};

		_scope.dragLeave = function(ev) {
			_scope.removeBorder($(ev.target));
		};

		_scope.drag = function(ev) {
			ev.target.id = "dragged-item";
			ev.target.entity = _scope.entity;
			ev.originalEvent.dataTransfer.setData("Text", ev.target.id);
		};

		_scope.drop = function(ev) {
			_scope.removeBorder($(ev.target));

			var id = ev.originalEvent.dataTransfer.getData("Text");
			var draggedItem = document.getElementById(id);
			draggedItem.id = "";
			var draggedEntity = draggedItem.entity;

			if (_scope.entity != draggedEntity) {
				if (draggedEntity.parent != _scope.entity) {
					var isDescendant = _scope.isDescendantOf(_scope.entity, draggedEntity);
					if (isDescendant == false) {
						var oldParent = draggedEntity.parent;
						oldParent.remove(draggedEntity);
						_scope.entity.add(draggedEntity);

						_scope.$apply();
					} else {
						console.warn(
							"Dragged entity '" +
							draggedEntity.name +
							"'' is parent of entity '" +
							_scope.entity.name +
							"'"
						);
					}
				} else {
					console.warn(
					"Dragged entity '" +
					_scope.entity.name +
					"' is already parent of '" +
					draggedEntity.name +
					"'"
				);
				}
			} else {
				console.warn(
					"Dragged entity '" +
					draggedEntity.name +
					"' and entity '" +
					_scope.entity.name +
					"' are the same"
				);
			}
		};

		_scope.addBorder = function(_element) {
		  var color = _element.css("color");
		  _element.css("border", "2px dashed " + color);
		};

		_scope.removeBorder = function(_element) {
		  _element.css("border", "0");
		};

		_scope.isGroup = function(_entity) {
			return _entity instanceof LR.Entity.Group
							|| _entity instanceof Phaser.Group
							|| _entity.type === Phaser.GROUP;
		};

		// check if an entity is descendant of an other

		_scope.isDescendantOf = function(_descendant, _parent) {

			var isDescendant = false;

			var parent = _descendant.parent;
			while (parent) {
				if (parent == _parent) {
					isDescendant = true;
				}

				parent = parent.parent;
			}

			return isDescendant;
		}

		_scope.main(_scope, _element, _attrs);
	};

	return {
		link: link,
		scope: {
			entity: '=entityDrag'
		},
	};
});