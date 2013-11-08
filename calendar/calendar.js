'use strict';

var Calendar = (function() {
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
			if (Object.prototype.toString.call(className) !== '[object Array]') {
				className = className.split(' ');
			}
			classArr = classArr.filter(function(iArr) {
				return className.indexOf(iArr) === -1;
			});

			node.className = classArr.join(' ');
		}
	}

	function hasClass(node, className) {
		if ((node) && (className)) {
			var classArr = node.className.split(' ');
			if (Object.prototype.toString.call(className) !== '[object Array]') {
				className = className.split(' ');
			}
			return className.every(function(iarr) {
				if (classArr.indexOf(iarr) > -1) {
					return true;
				} else {
					return false;
				}
			});
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

	function unbind(obj, event_name, handler_wrapper) {
		if (obj.removeEventListener) {
			obj.removeEventListener(event_name, handler_wrapper, false);
		} else if (obj.detachEvent) {
			obj.detachEvent('on' + event_name, handler_wrapper);
		}
	}

	function Calendar(calendarNode) {
		this.domNodes = calendarNode;
		this.dayCarusel = calendarNode.querySelector('.areaDays');
		this.days = [];
		this.position = 0;
		this.init();
		var self = this;
		var scrollWrap = undefined;

		var clicked = function(event) {

			if (hasClass(event.target, 'back')) {
				self.backFrame();
			}

			if (hasClass(event.target, 'next')) {
				self.nextFrame();
			}

			if (hasClass(event.target, 'first')) {
				self.backFrame('up');
			}

			if (hasClass(event.target, 'last')) {
				self.nextFrame('down');
			}

			if (event.target.nodeName === "LI") {
				self.choose(event.target);
			}

		}

		bind(this.domNodes, 'click', clicked);

		if (self.dayCarusel.addEventListener) {
			if ('onwheel' in document) {
				self.dayCarusel.addEventListener("wheel", onWheel, false);
			} else if ('onmousewheel' in document) {
				self.dayCarusel.addEventListener("mousewheel", onWheel, false);
			} else {
				self.dayCarusel.addEventListener("MozMousePixelScroll", onWheel, false);
			}
		} else {
			self.dayCarusel.attachEvent("onmousewheel", onWheel);
		}

		function onWheel(event) {
			event = event || window.event;

			var delta = event.deltaY || event.detail || event.wheelDelta;

			if (delta < 0) {
				self.backFrame();
			} else {
				self.nextFrame();
			}

			event.preventDefault ? event.preventDefault() : (event.returnValue = false);
		}

	}

	Calendar.prototype.init = function() {
		var thisDate = new Date();
		switch (thisDate.getMonth()) {
			case 0:
				this.currentMonth = "января";
				break;
			case 1:
				this.currentMonth = "февраля";
				break;
			case 2:
				this.currentMonth = "марта";
				break;
			case 3:
				this.currentMonth = "апреля";
				break;
			case 4:
				this.currentMonth = "мая";
				break;
			case 5:
				this.currentMonth = "июня";
				break;
			case 6:
				this.currentMonth = "июля";
				break;
			case 7:
				this.currentMonth = "августа";
				break;
			case 8:
				this.currentMonth = "сентября";
				break;
			case 9:
				this.currentMonth = "октября";
				break;
			case 10:
				this.currentMonth = "ноября";
				break;
			case 11:
				this.currentMonth = "декабря";
				break;
		}

		var currentDate = thisDate.getDate();
		var dayInMonth = 33 - (new Date(thisDate.getFullYear(), thisDate.getMonth(), 33)).getDate();

		for (var i = 0; i < dayInMonth; i += 1) {
			var day = document.createElement('li');
			i < 9 ? day.innerHTML = '0' + (i + 1) : day.innerHTML = i + 1;
			this.dayCarusel.appendChild(day);
			this.days.push(day);
			if (i + 1 === currentDate) {
				this.choose(day);
				if (day.offsetHeight * (i + 1) > this.dayCarusel.parentNode.offsetHeight) {

					if (day.offsetHeight * i / this.dayCarusel.parentNode.offsetHeight > 1.1) {
						this.position = -day.offsetHeight * (i + 1) + this.dayCarusel.parentNode.offsetHeight;
					} else {
						this.position = -day.offsetHeight * i;
					}
					this.dayCarusel.style.marginTop = this.position + 'px';


				}
			}
		}
	}


	Calendar.prototype.nextFrame = function(option) {
		var carusel = this.dayCarusel;
		var days = this.days;
		var self = this;
		var caruselHeight = this.dayCarusel.parentNode.offsetHeight;
		var cellHeight = this.days[0].offsetHeight;

		if (option) {
			this.position = -cellHeight * this.days.length + caruselHeight;
			this.dayCarusel.style.marginTop = this.position + 'px';
		} else {
			if (this.position > -cellHeight * this.days.length + caruselHeight)
				this.position -= cellHeight;
			this.dayCarusel.style.marginTop = this.position + 'px';
		}
	}


	Calendar.prototype.backFrame = function(option) {
		var carusel = this.dayCarusel;
		var days = this.days;
		var self = this;
		var cellHeight = this.days[0].offsetHeight;

		if (option) {
			this.position = 0;
			this.dayCarusel.style.marginTop = this.position + 'px';
		} else {
			if (this.position < 0) {
				this.position += cellHeight;

				this.dayCarusel.style.marginTop = this.position + 'px';
			}
		}
	}

	Calendar.prototype.choose = function(node) {
		var self = this;
		var span;

		for (var i = 0; i < this.days.length; i += 1) {
			span = this.days[i].querySelector('span');
			if (span !== null) {
				this.days[i].removeChild(span);
			}
			removeClass(this.days[i], 'current');
		}
		span = document.createElement('span');
		span.innerHTML = this.currentMonth;
		node.appendChild(span);
		addClass(node, 'current');

		// Обьект выбранной пользователем даты
		this.choosenDate = new Date(new Date().setDate(this.days.indexOf(node) + 1));
	}

	return Calendar;
})();

var calendarNodes = document.querySelectorAll('.calendar');
// Создание объектов
for (var i = 0; i < calendarNodes.length; i += 1) {
	var calendarObj = new Calendar(calendarNodes[i]);
}