'use strict';
/* ##################################

Недостатки реализации:
1) Код работает только на страницах типа http://www.explosm.net/comics/***
2) По достижении предпоследней картинки код прерывается
3) При быстром скроллинге очереди в 3 изображения бывает недостаточно

#####################################*/
(function() {
	/* TOOLBOX */

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

	var closest = (function() {
		return function(node, callback) {
			var nextParent = node;

			while (nextParent && (!callback(nextParent))) {
				nextParent = nextParent.parentNode;
			}
			return nextParent;
		}
	})();

	function getCoords(elem) {
		var box = elem.getBoundingClientRect();

		var body = document.body;
		var docElem = document.documentElement;

		var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

		var clientTop = docElem.clientTop || body.clientTop || 0;
		var clientLeft = docElem.clientLeft || body.clientLeft || 0;

		var top = box.top + scrollTop - clientTop;
		var left = box.left + scrollLeft - clientLeft;

		return {
			top: Math.round(top),
			left: Math.round(left)
		};
	}

	/* Создание класса ImageStack для работы с очередями обьектов с изображениями */

	var ImageStack = function(url) {
		this.queue = [];
		this.url = url;
		this.behaviourCheck = false;
		this.scrollWrapper = null;
		this.fillQueue();
	}

	// Метод наполнения очереди, при полной очереди навешивается обработчик скроллирования
	ImageStack.prototype.fillQueue = function() {
		var self = this;
		if (this.queue.length < 3) {
			var xmlhttp = getXmlHttp();
			xmlhttp.open('GET', self.url, true);
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState === 4) {
					if (xmlhttp.status === 200) {
						var body = document.createElement('body');
						body.innerHTML = xmlhttp.responseText.match(/<body>[\s\S]*<\/body>/gim)[0];
						var img = body.querySelector('[alt="Cyanide and Happiness, a daily webcomic"]');
						var imgConteiner = closest(img, function(node) {
							return node.hasAttribute('align','center');
						});
						self.queue.push(imgConteiner);
						self.url = body.querySelector('[rel="prev"]').href;
						self.fillQueue();
					}
				}
			}
			xmlhttp.send(null);
		} else {
			self.addBehaviour();
			return;
		}
	}

	/* Метод получения обьекта из очереди, при этом снимается последний обработчик 
и вызывается метод на дозагрузку обьектов в очередь */
	ImageStack.prototype.getImage = function() {
		var self = this;
		var imgConteiner = this.queue.shift();
		unbind(window, 'scroll', self.scrollWrapper);
		this.fillQueue();
		return imgConteiner;
	}

	/* Метод навешивания обработчика, 
в котором учитывается местоположение последнего обьекта с изображением на странице */
	ImageStack.prototype.addBehaviour = function() {
		var self = this;
		var scrollHandler = function(event) {
			var scrolled = window.pageYOffset || document.documentElement.scrollTop;
			var imgs = document.querySelectorAll('[alt="Cyanide and Happiness, a daily webcomic"]');
			var lastImg = imgs[imgs.length - 1];
			var imgTop = getCoords(lastImg).top;
			var windowHeight = document.documentElement.clientHeight;

			if ((scrolled + windowHeight) > imgTop) {
				self.addImgOnPage(self.getImage());
			}
		}

		this.scrollWrapper = bind(window, 'scroll', scrollHandler);
	}

	// Метод добавления обьекта с изображением в конец блока с изображениями
	ImageStack.prototype.addImgOnPage = function(img) {
		var firstImg = document.querySelector('[alt="Cyanide and Happiness, a daily webcomic"]');
		var imgConteiner = closest(firstImg, function(node) {
			return node.hasAttribute('align','center');
		});
		imgConteiner.appendChild(img);
	}

	/* Получение ссылки на предидущую страницу и инициализация обьекта */

	var url = document.querySelector('[rel="prev"]').href;

	var images = new ImageStack(url);


})();