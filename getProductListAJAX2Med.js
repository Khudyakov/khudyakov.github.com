'use strict';
/* ##################################

Недостатки реализации:
1) Код работает только со страниц домена rozetka.com.ua

#####################################*/
(function(callback) {
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

	var mediator = (function() {
		var events;

		events = {};
		return {
			subscribe: function(event_name, callback) {
				if (!events[event_name]) {
					events[event_name] = [];
				}
				events[event_name].push(callback);
			},

			unsubscribe: function(event_name, callback_) {
				if (arguments.length === 1) {
					delete events[event_name];
				} else {
					if (events[event_name]) {
						events[event_name] = events[event_name].filter(function(callback) {
							return callback !== callback_;
						});
					}
				}
			},

			publish: function(event_name, data) {
				var callbacks;
				var i;

				callbacks = events[event_name];
				if (callbacks && callbacks.length) {
					for (i = 0; i < callbacks.length; i += 1) {
						callbacks[i].call(undefined, data);
					}
				}
			}
		}
	}());

	// Функция формирования обьектов с данными на узле страницы и добавления в общий массив
	var generateProductList = function(node) {
		var productWrapers = node.querySelectorAll('.gtile-i-wrap');

		function getProductObject(productWraper) {
			var productObject = {};
			var nameNode = productWraper.querySelector('.gtile-i-title a');
			var priceUaNode = productWraper.querySelector('.g-price-uah');
			var priceUsdNode = productWraper.querySelector('.g-price-usd');
			var memoryNode = productWraper.querySelectorAll('.gtile-short-detail li')[0];

			productObject.name = nameNode.innerHTML.match(/\S+/g).join(' ');
			productObject.url = nameNode.href;
			if (priceUsdNode) {
				productObject.usd = parseFloat(priceUsdNode.innerHTML.match(/\d+(.\d+)?/g)[0]).toFixed(2);
			} else {
				productObject.usd = 0;
			}
			if (priceUsdNode) {
				productObject.ua = parseFloat(priceUaNode.innerHTML.match(/(\d+(.\d+)?)/g)[0]).toFixed(2);
			} else {
				productObject.ua = 0;
			}
			productObject.memory = memoryNode.innerHTML.match(/\d+/g)[0];

			return productObject;
		}

		for (var i = 0; i < productWrapers.length; i += 1) {
			productList.push(getProductObject(productWrapers[i]));
		}
	}

	/* ------------ */

	var productList = [];
	var URL = 'http://rozetka.com.ua/usb-flash-memory/c80045/';
	var xmlhttp = getXmlHttp();
	var pageCount;
	var readyCheck = 0;
	var reqCount = 3;
	// Подпись на события запуска цепочек и готовности списка
	for (var i = 0; i < reqCount; i += 1) {
		mediator.subscribe('startRequests', getOtherPages);
	}
	mediator.subscribe('listReady', callback);


	// Первая отправка запроса на получение первой страницы товаров
	xmlhttp.open('GET', URL, true);
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4) {
			if (xmlhttp.status === 200) {
				var body = document.createElement('body');
				body.innerHTML = xmlhttp.responseText.match(/<body>[\s\S]*<\/body>/gim)[0];
				generateProductList(body);
				var pager = body.querySelectorAll('.goods-pages-list li');
				// Получение значения количества страниц с товарами
				pageCount = parseInt(pager[pager.length - 1].getAttribute('id').match(/\d+/g)[0]);
				// Вызов цепочек запросов подгрузки дополнительных страниц
				mediator.publish('startRequests');

			} else {
				console.log("rozetka.com.ua: permission denied!");
			}
		}
	}

	xmlhttp.send(null);

	// Рекурсивная функция подгрузки доп страниц

	function getOtherPages() {
		/* Когда страницы, которые еще не были загружены закончатся -
		счетчик отработки цепочек увеличивается на единицу,
		и при равном количестве отработанных и созданных цепочек происходит событие вывода результата*/

		if (pageCount > 1) {
			var url = URL + 'page=' + pageCount + '/';
			pageCount -= 1;
		} else {
			readyCheck += 1;
			if (readyCheck === reqCount) {
				mediator.publish('listReady', productList);
			}
			return;
		}

		var request = getXmlHttp();
		request.open('GET', url, true);
		request.onreadystatechange = function() {
			if (request.readyState === 4) {
				if (request.status === 200) {
					var body = document.createElement('body');
					body.innerHTML = request.responseText.match(/<body>[\s\S]*<\/body>/gim)[0];
					generateProductList(body);
					getOtherPages();
				} else {
					console.log('Requests denied...');
					getOtherPages();
				}
			}
		}
		request.send(null);
	}
})(showProductList);

function showProductList(data) {
	console.log(data);
	console.log('Количество товаров: ' + data.length);
}