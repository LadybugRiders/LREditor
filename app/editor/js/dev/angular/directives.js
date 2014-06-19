'use strict';

/* Directives */

var moduleDirectives = angular.module('Loopy.directives', []);

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

moduleDirectives.directive('listEntities', function() {
	function link(_scope, _element, _attrs) {
		var element = _element;
		if (element.length > 0) element = element[0];

		fillListEntities(_scope, element, _scope.objects);

		_scope.$watch('objects', function(_value) {
			fillListEntities(_scope, element, _value);
		});
	};

	// create the entities list
	function fillListEntities(_scope, _element, _entities, _allClose) {
		var rootEntities = new Array();
		if (_entities) {
			if (_entities.length == null) {
				rootEntities.push(_entities);
			} else {
				rootEntities = _entities;
			}
		}

		// empty the root list
		empty(_element);
		var ul = document.createElement("ul");
		_element.appendChild(ul);

		for (var i = (rootEntities.length - 1); i >= 0; i--) {
			printEntity(_scope, rootEntities[i], ul);
		};
	};

	// empty a DOM element (using jQuery)
	function empty(_element) {
		if (_element.empty) {
			_element.empty();
		} else {
			$(_element).empty();
		}
	};

	// create an entity and its descendants recursively
	function printEntity(_scope, _entity, _parentElement) {
		if (_entity) {
			var isGroup = _scope.isGroup(_entity);

			// create the entity's li element
			var li = document.createElement("li");
			li.setAttribute("class", "entity");
			li.entity = _entity;
			
			_parentElement.appendChild(li);

			// only group can have children
			if (isGroup) {
				// create button to show/hide descendants
				createCollapse(_scope, _entity, li);
			}

			// create the a element with the entity's name
			createA(_scope, _entity, li);

			// create arrows to change entity's z-index
			createArrows(_scope, _entity, li);

			// only group can have children
			if (isGroup) {
				var ul = document.createElement("ul");
				ul.style.display = "none";
				li.appendChild(ul);

				// for each child
				if (_entity.children) {
					if (_entity.children.length > 0) {
						for (var i = (_entity.children.length - 1); i >= 0; i--) {
							var child = _entity.children[i];
							// create entity and its descendants
							printEntity(_scope, child, ul);
						};
					}
				}
			}
		}
	};

	// create button to show/hide entity's descendants
	function createCollapse(_scope, _entity, _parentElement) {
		var collapse = document.createElement("a");

		collapse.setAttribute("type", "button");
		collapse.setAttribute("class", "chevron");
		var chevron = document.createElement("span");
		chevron.setAttribute("class", "glyphicon glyphicon-chevron-right");
		collapse.onclick = function(_event) {
			var element = $(_event.target);
			if (element.attr("type") != "button") {
				element = element.parent();
			}
			var parent = element.parent();
			
			var lists = parent.children("ul");
			if (lists) {
				if (lists.length > 0) {
					var ul = lists[0];
					if (ul.style.display == "none") {
						ul.style.display = "block";
						element.children("span").attr("class", "glyphicon glyphicon-chevron-down")
					} else {
						ul.style.display = "none";
						element.children("span").attr("class", "glyphicon glyphicon-chevron-right")
					}
				}
			}
		};
		collapse.appendChild(chevron);

		_parentElement.appendChild(collapse);
	}

	// create the a element with the entity's name
	function createA(_scope, _entity, _parentElement) {
		var isGroup = _scope.isGroup(_entity);

		var a = document.createElement("a");
		a.textContent = _entity.name;
		a.onclick = function(_event) {
				_scope.$apply(function() {
					_scope.selectEntity(_entity);
			});
		};

		if (isGroup == false) {
			a.setAttribute("class", "margin-left");
		}
		a.draggable = true;
		a.ondragstart = drag;
		// only group can have children
		if (isGroup) {
			a.ondrop = drop;
			a.ondragover = dragOver;
			a.ondragenter = dragEnter;
			a.ondragleave = dragLeave;
		}
		
		_parentElement.appendChild(a);
	};

	// create arrows to change entity's z-index
	function createArrows(_scope, _entity, _parentElement) {
		var arrows = document.createElement("span");

		arrows.setAttribute("class", "arrows");

		var arrowDown = document.createElement("a");
		var arrowDownSpan = document.createElement("span");
		arrowDownSpan.setAttribute("class", "glyphicon glyphicon-arrow-down");
		arrowDownSpan.onclick = function(_event) {
			var li = null;
			if (_event.target.localName == "span") {
				li = _event.target.parentNode.parentNode.parentNode;
			} else if (_event.target.localName == "a") {
				li = _event.target.parentNode.parentNode;
			}

			if (li) {
				var prev = li.nextSibling;
				if (prev) {
					li.parentNode.insertBefore(prev, li);
				} else {
					console.warn("no next li");
				}
			}

			_scope.moveDown(_entity);
		};
		arrowDown.appendChild(arrowDownSpan);
		arrows.appendChild(arrowDown);

		var arrowUp = document.createElement("a");
		var arrowUpSpan = document.createElement("span");
		arrowUpSpan.setAttribute("class", "glyphicon glyphicon-arrow-up");
		arrowUpSpan.onclick = function(_event) {
			var li = null;
			if (_event.target.localName == "span") {
				li = _event.target.parentNode.parentNode.parentNode;
			} else if (_event.target.localName == "a") {
				li = _event.target.parentNode.parentNode;
			}

			if (li) {
				var prev = li.previousSibling;
				if (prev) {
					li.parentNode.insertBefore(li, prev);
				} else {
					console.warn("no previous li");
				}
			}

			_scope.moveUp(_entity);
		};
		arrowUp.appendChild(arrowUpSpan);
		arrows.appendChild(arrowUp);

		_parentElement.appendChild(arrows);
	}

	function dragOver(ev) {
	  ev.preventDefault();
	}

	function dragEnter(ev) {
		if (ev.target) {
			var element = ev.target;
			if (element.localName != "li") element = element.parentNode;

	    if (element.localName == "li") {
	    	// show borders
	    	element.style.border = "1px dashed black";
	    }
	  }
	}

	function dragLeave(ev) {
		if (ev.target) {
			var element = ev.target;
			if (element.localName != "li") element = element.parentNode;
	    
	    if (element.localName == "li") {
	    	// hide borders
	    	element.style.border = "0px";
	    }
	  }
	}

	function drag(ev) {
		var element = ev.target;

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
		}
	}

	function drop(ev) {
		if (ev.target) {
			var element = ev.target;
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
			}
		}

		// hide all borders
		$("#entities .list-entities *").css("border", "0px")
	};

	// check if an entity is descendant of an other
	function isDescendantOf(_descendant, _parent) {
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

	return {
		link: link
	};
});

