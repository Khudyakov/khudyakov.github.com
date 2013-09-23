'use strict';
/* ##################################

Недостатки реализации:
1) Код работает только со страниц домена rozetka.com.ua
2) Сбой в загрузке цепочки запросов при ошибке одного из запросов

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
	var reqComplete = 0;

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
				var pageCount = parseInt(pager[pager.length - 1].getAttribute('id').match(/\d+/g)[0]);
				// Вызов цепочек запросов подгрузки дополнительных страниц
				var startPage = 1;
				var endPage = startPage + pageCount % 3;

				for (var i = 0; i < 3; i += 1) {
					var reqChain = getXmlHttp();
					getOtherPages(startPage, endPage, reqChain);
					i === 1 ? endPage = pageCount : endPage += pageCount % 3;
					startPage += pageCount % 3;
				}

			} else {
				console.log("rozetka.com.ua: permission denied!")
			}
		}
	}

	xmlhttp.send(null);

	// Рекурсивная функция подгрузки доп страниц одну за другой

	function getOtherPages(startPage, endPage, request) {
		// При достижении последней страницы - выход из рекурсии
		if (startPage < endPage) {
			startPage += 1;
		} else {
			return;
		}

		var url = URL + 'page=' + startPage + '/';
		request.open('GET', url, true);
		request.onreadystatechange = function() {
			if (request.readyState === 4) {
				if (request.status === 200) {
					var body = document.createElement('body');
					body.innerHTML = request.responseText.match(/<body>[\s\S]*<\/body>/gim)[0];
					generateProductList(body);
					if (startPage === endPage) {
						reqComplete += 1;
						if (reqComplete === 3) {
							// Осуществление действий когда все цепочки отработали
							callback(productList);
						}
					}
					getOtherPages(startPage, endPage, request);
				} else {
					startPage += 1;
					console.log('One of requests denied...Data will be incomplete');
					getOtherPages(startPage, endPage, request);
				}
			}
		}
		request.send(null);
	}
})(showProductList);

function showProductList(data) {
	console.log(data);
	console.log('Количество товаров: ' + data.length)
}