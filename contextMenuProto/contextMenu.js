'use strict';

var Menu = (function() {

	// TOOLBOX
	function addClass(node, className) {
		if ((node) && (className)) {
			var classArr = node.className.split(' ');

			if (Object.prototype.toString.call(className) !== '[object Array]') {
				className = className.split(' ');
			}

			className = className.filter(function(iArr) {
				return classArr.indexOf(iArr) === -1;
			});

			className.forEach(function(iArr) {
				classArr.push(iArr);
			});

			node.className = classArr.join(' ');

		}

	}

	function removeClass(node, className) {
		if ((node) && (className)) {
			var classArr = node.className.split(' ');
			// className в случае если это строка, переводится к массиву
			if (Object.prototype.toString.call(className) !== '[object Array]') {
				className = className.split(' ');
			}
			// отбираем из классов узла только те, которые не встречаются в аргументе className
			classArr = classArr.filter(function(iArr) {
				return className.indexOf(iArr) === -1;
			});

			node.className = classArr.join(' ');
		}
	}

	function hasClass(node, className) {
		if (node.className) {
			if ((node) && (className)) {
				var classArr = node.className.split(' ');
				// className в случае если это строка, переводится к массиву
				if (Object.prototype.toString.call(className) !== '[object Array]') {
					className = className.split(' ');
				}
				// если все классы в аргументе className есть в узле, то возвращаем true
				return className.every(function(iarr) {
					if (classArr.indexOf(iarr) > -1) {
						return true;
					} else {
						return false;
					}
				});
			}
		} else {
			return false;
		}
	}


	function bind(obj, event_name, handler) {
		var handler_wrapper = function(event) {
			event = event || window.event;
			if (!event.target && event.srcElement) {
				event.target = event.srcElement;
			}
			return handler.call(obj, event);
		};

		if (obj.addEventListener) {
			obj.addEventListener(event_name, handler_wrapper, false);
		} else if (obj.attachEvent) {
			obj.attachEvent('on' + event_name, handler_wrapper);
		}
		return handler_wrapper;
	}

	function preventDefault(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	}

	//Menu constructor

	var Menu = function(menuData, focusNode) {
		this.menuDom = this.createMenu(menuData);
		this.addBehaviour(focusNode);
		document.body.appendChild(this.menuDom);
	}


	Menu.prototype.createMenu = function(dataObject) {
		var self = this;
		var ul = document.createElement('ul');
		addClass(ul, ['menu', 'hide']);
		for (var key in dataObject) {
			var li = document.createElement('li');
			li.innerHTML = key;
			addClass(li, 'item');
			if (Object.prototype.toString.call(dataObject[key]) === '[object Object]') {
				addClass(li, 'submenu');
				li.appendChild(self.createMenu(dataObject[key]));
			} else {
				bind(li, 'click', dataObject[key]);
			}
			ul.appendChild(li);
		}
		return ul;
	}


	Menu.prototype.addBehaviour = function(node) {
		var self = this;
		var mainMenu = this.menuDom;
		var menus = this.menuDom.querySelectorAll('.menu');

		bind(node, 'contextmenu', function(event) {
			removeClass(mainMenu, 'hide');
			mainMenu.style.top = event.clientY + 'px';
			mainMenu.style.left = event.clientX + 'px';

			preventDefault(event);
		});

		bind(document, 'click', function(event) {
			if (!hasClass(event.target, 'item')) {
				addClass(mainMenu, 'hide');
			}
		});

		var subMenusLi = this.menuDom.querySelectorAll('.submenu');
		var subMenu;

		var mouseenterHandler = function(event) {
			removeClass(this.childNodes[1], 'hide');
		}

		var mouseleaveHandler = function(event) {
			var shownMenu = this.querySelectorAll('.menu');
			for (var i = 0; i < shownMenu.length; i += 1) {
				addClass(shownMenu[i], 'hide');
			}
		}

		for (var i = 0; i < subMenusLi.length; i += 1) {
			subMenu = subMenusLi[i];

			bind(subMenu, 'mouseenter', mouseenterHandler);


			bind(subMenu, 'mouseleave', mouseleaveHandler);

		}

	}

	return Menu;
})();

/*
function getMenuData(url) {
	function getXmlHttp() {
		var xmlhttp;
		try {
			xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (E) {
				xmlhttp = false;
			}
		}
		if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
			xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
	}

	if (Object.prototype.toString.call(url) === '[object Object]') {
		return url;
	} else {
		var xmlhttp = getXmlHttp();
		xmlhttp.open('GET', url, true);
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				if (xmlhttp.status === 200) {
					getMenuData(JSON.parse(xmlhttp.responseText));
				}
			}
		}
		xmlhttp.send(null);
	}
}
*/

// структура меню с действиями по нажатию на пункты
var menuData = {
	View: function() {
		console.log('view');
	},
	Sort: {
		Catalogs: function() {
			console.log('catalogs');
		},
		Files: function() {
			console.log('files');
		}
	},
	Reload: function() {
		console.log('reload');
	},
	Past: function() {
		console.log('past');
	},
	Copy: function() {
		console.log('copy');
	},
	Create: {
		Catalog: function() {
			console.log('catalog');
		},
		File: function() {
			console.log('file');
		},
		Image: {
			Big: function() {
				console.log('big');
			},
			Middle: function() {
				console.log('middle');
			},
			Small: function() {
				console.log('small');
			}
		}
	}
}


new Menu(menuData, document);