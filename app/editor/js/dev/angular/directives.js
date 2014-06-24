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

		_scope.init = function(_scope, _element, _attrs) {
			var isGroup = _scope.isGroup(_scope.entity);

			_element.attr("draggable" , true);
			_element.on({dragstart: _scope.drag});
			// only group can have children
			if (isGroup) {
				_element.on({
					drop: _scope.drop,
					drag: _scope.drag,
					dragover: _scope.dragOver,
					dragenter: _scope.dragEnter,
					dragleave: _scope.dragLeave
				});
			}

			console.log("ok");
		};

		_scope.isGroup = function(_entity) {
			return _entity instanceof LR.Entity.Group
							|| _entity instanceof Phaser.Group
							|| _entity.type === Phaser.GROUP;
		};

		_scope.dragOver = function(ev) {
	  	ev.preventDefault();
		};

		_scope.dragEnter = function(ev) {
			/*if (ev.target) {
				var element = ev.target;
				if (element.localName != "li") element = element.parentNode;

		    if (element.localName == "li") {
		    	// show borders
		    	element.style.border = "1px dashed black";
		    }
		  }*/
		};

		_scope.dragLeave = function(ev) {
			/*if (ev.target) {
				var element = ev.target;
				if (element.localName != "li") element = element.parentNode;
		    
		    if (element.localName == "li") {
		    	// hide borders
		    	element.style.border = "0px";
		    }
		  }*/
		};

		_scope.drag = function(ev) {
			/*var element = ev.target;

			var cpt = 0;
			// get parent li
			while (element.localName != "li" && cpt < 10) {
				element = element.parentNode;

				cpt++;
			}

			if (element) {
				element.id = "dragged-item";
		  	ev.dataTransfer.setData("Text", element.id);
		  	ev.dataTransfer.setData("Object", element.entity);
			}*/
			//ev.originalEvent.dataTransfer.effectAllowed = 'move';
			console.log(ev);
			ev.target.id = "dragged-item";
			ev.target.entity = _scope.entity;
			ev.originalEvent.dataTransfer.setData("Text", ev.target.id);
			//ev.dataTransfer.setData("Object", _scope.entity);
		};

		_scope.drop = function(ev) {
			console.log(ev);
			if (ev.target) {
				/*var element = ev.target;
				if (element.localName != "li") element = element.parentNode;
				var uls = element.getElementsByTagName("ul");
				if (uls.length > 0) {
					var ul = uls[0];

					ev.preventDefault();
				  var data = ev.dataTransfer.getData("Text");
				  var draggedItem = document.getElementById(data);
				  if (draggedItem) {
				  	var entity = element.entity;
				  	if (entity) {
				  		var draggedEntity = draggedItem.entity;
				  		if (draggedEntity) {
				  			if (entity != draggedEntity) {
				  				if (isDescendantOf(entity, draggedEntity) == false) {
					  				var oldParent = draggedEntity.parent;
										oldParent.remove(draggedEntity);
										entity.add(draggedEntity);

										ul.insertBefore(draggedItem, ul.firstChild);
						  			draggedItem.id = "";
					  			} else {
					  				console.error("dragged item is parent of current item");
					  			}
				  			} else {
				  				console.error("dragged item and current item are the same");
				  			}
				  		} else{
					  		console.warn("no entity attached to dragged li");
					  	}
				  	} else{
				  		console.warn("no entity attached to li");
				  	}
				  }
				}*/
			}

			var id = ev.originalEvent.dataTransfer.getData("Text");
			console.log(id);
			var draggedItem = document.getElementById(id);
			var draggedEntity = draggedItem.entity;

			var oldParent = draggedEntity.parent;
			oldParent.remove(draggedEntity);
			_scope.entity.add(draggedEntity);

			_scope.$apply();
			// hide all borders
			//$("#entities .list-entities *").css("border", "0px")
		};


		_scope.init(_scope, _element, _attrs);
	};

	return {
		link: link,
		scope: {
			entity: '=entityDrag'
		},
	};
});