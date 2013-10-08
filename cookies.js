'use strict';
/* ################################
Код обновляет старые данные в куках при возвращении на уже проанализированную страницу,
запись в куки происходит по формату: [link+текущее время] = урл страницы = урл ссылки = количество наведений

Особенности:
1) Для определения корневого домена используется массив доменов первого уровня
2) Создание отдельной записи в куках для каждой ссылки на сайте

Тестировал на: jquery.com, yandex.ru
   ################################ */
(function() {
	// filter polifil
	[].filter || (Array.prototype.filter = // Use the native array filter method, if available.

		function(a, //a function to test each value of the array against. Truthy values will be put into the new array and falsy values will be excluded from the new array
			b, // placeholder
			c, // placeholder 
			d, // placeholder
			e // placeholder
		) {
			c = this; // cache the array
			d = []; // array to hold the new values which match the expression
			for (e in c) // for each value in the array, 
			~~ e + '' == e && e >= 0 && // coerce the array position and if valid,
			a.call(b, c[e], +e, c) && // pass the current value into the expression and if truthy,
			d.push(c[e]); // add it to the new array

			return d; // give back the new array
		});

	// TOOLBOX

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

	function preventDefault(event) {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	}

	function closest(node, callback) {
		var nextParent = node;

		while (nextParent && (!callback(nextParent))) {
			nextParent = nextParent.parentNode;
		}
		return nextParent;
	}

	// Получение "старых" данных из кук

	function getCookieData(cookieString, data) {
		var nameExp = /link\d+(?=\=)/g;
		var urlsExp = /(?:link)(.+?)(?=;|$)/g;
		if (cookieString.match(nameExp) !== null) {
			var urls = cookieString.match(urlsExp);
			for (var i = 0; i < urls.length; i += 1) {
				var urlStr = urls[i].replace(/link\d+\=/g, '');
				var urlArr = urlStr.split('%3D');
				data.pageUrl[i] = urlArr[0];
				data.linkUrl[i] = urlArr[1];
				data.count[i] = parseInt(urlArr[2]);
			}
			data.names = cookieString.match(nameExp);
		}
		return data;
	}
	// Установка данных в куки с возможным удалением при наличии аргумента delPosition

	function setCookieData(data, delPosition) {
		if (data.names.length !== 0) {
			var str;
			var expDate;
			// получение строки корневого домена
			var domains = ['com.ua', 'biz.ua', 'co.ua', 'in.ua', 'kiev.ua', 'in.net', 'pp.ua', 'org.ua', 'net.ua'];
			var hostName = location.hostname;
			var k = 0;
			for (var i = 0; i < domains.length; i += 1) {
				if (hostName.indexOf(domains[i]) > -1) {
					k += 1;
				}
			}
			var hostNameArr = hostName.split('.');
			hostNameArr = (k === 1) ? hostNameArr.slice(-3) : hostNameArr.slice(-2);
			hostNameArr = hostNameArr.filter(function(iArr) {
				return iArr !== 'www';
			});
			var domain = '.' + hostNameArr.join('.');
			// установка необходимой даты срока годности и запись в куки полученных данных
			for (var i = 0; i < data.names.length; i += 1) {
				if ((delPosition !== undefined) && (i === delPosition)) {
					expDate = new Date(0).toUTCString();
				} else {
					expDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24).toUTCString();
				}
				str = data.names[i] + '=' + data.pageUrl[i] + '%3D' + data.linkUrl[i] + '%3D' + data.count[i] + ';expires=' + expDate + ';domain=' + domain + ';path=/';
				document.cookie = str;
			}
		} else {
			return;
		}
	}

	var data = {
		names: [],
		pageUrl: [],
		linkUrl: [],
		count: []
	};
	var OVERRED_TIME = 2000;

	data = getCookieData(document.cookie, data);
	// делегирование наведения мыши на ссылку
	var mouseOverHandler = function(event) {
		var targetNode = event.target;
		var overTime = (new Date()).getTime();
		var link = closest(targetNode, function(node) {
			return node.nodeName === 'A';
		});

		if ((link !== null) && (link.nodeName === 'A')) {
			var linkUrl = link.href;
			var pageUrl = document.location.href;
			// создание новой записи в данных или обновление старой
			if ((data.linkUrl.indexOf(linkUrl) === -1) || (data.pageUrl.indexOf(pageUrl) === -1)) {
				data.names.push('link' + (new Date()).getTime());
				data.pageUrl.push(pageUrl);
				data.linkUrl.push(linkUrl);
				data.count.push(1);
			} else {
				var position = data.linkUrl.indexOf(linkUrl);
				data.count[position] += 1;
			}
			// по нажатию на ссылку кука с данными на эту ссылку удаляется и обновляются данные
			var clickWrapper = bind(targetNode, 'click', function(event) {
				preventDefault(event);
				var position = data.linkUrl.indexOf(linkUrl);
				setCookieData(data, position);
				data.names.splice(position, 1);
				data.pageUrl.splice(position, 1);
				data.linkUrl.splice(position, 1);
				data.count.splice(position, 1);
				unbind(targetNode, 'click', clickWrapper);
				location.href = linkUrl;
			});
			// по убытию мыши с ссылки просходит запись в куки
			var outWrapper = bind(targetNode, 'mouseout', function(event) {
				var outTime = (new Date()).getTime();
				if ((outTime - overTime) > OVERRED_TIME) {
					setCookieData(data);
				} else {
					var position = data.linkUrl.indexOf(linkUrl);
					if (data.count[position] === 1) {
						data.names.splice(position, 1);
						data.pageUrl.splice(position, 1);
						data.linkUrl.splice(position, 1);
						data.count.splice(position, 1);
					} else {
						data.count[position] -= 1;
					}
				}
				unbind(targetNode, 'mouseout', outWrapper);
			});
		}
	};

	bind(document, 'mouseover', mouseOverHandler);

})();