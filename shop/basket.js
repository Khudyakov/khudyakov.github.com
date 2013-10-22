'use strict';
/*   ################################

	Модуль работы с корзиной (мини-инфо корзины и поп-ап):
	1) Навешивание обработчиков на поп-ап и мини-инфо корзины
	2) Подписывание функций в медиаторе на события кнопок таблицы "купить" и "удалить", которые
		изменяют обьект корзины
	3) Вспомогательные функции записи и чтения куки

	 ################################ */
var basketModule = (function (cartMini, popup, generateContent, sortTable, Mediator) {

	var mediator = new Mediator();
	var basket = getBasketData();
	var basketTable = popup.find('.goods');
	var basketContent = popup.find('.goods tbody');
	var basketHeader = popup.find('.goods thead th');
	var sortHeaders = popup.find('.sort');
	var pInfo = popup.find('.pinfo span');
	var cartInfo = cartMini.find('span');
	var clearButton = popup.find('.clear');

	cartMini.on('click', function() {
		popup.addClass('show');
	});

	popup.on('click', function(event) {
		self = $(event.target);
		if (self.hasClass('popup_wrap') || self.hasClass('close')) {
			popup.removeClass('show');
		}
	});

	clearButton.on('click', function(event) {
		event.preventDefault();
		basket = [];
		setBasketData(basket);
		mediator._publish('refreshData', basket);
		popup.removeClass('show');
	})

	mediator.subscribe('refreshData', refreshCartTab);
	mediator.subscribe('refreshData', refreshCartInfo);
	mediator._publish('refreshData', basket);


	function refreshCartTab(data) {
		sortHeaders.off('click');
		sortHeaders.on('click', function() {
			var self = $(this);
			debugger
			sortTable(self, data, self.attr('dataType'), basketTable, mediator);
		});

		generateContent(basketHeader, basketContent, data, mediator);
	}

	function refreshCartInfo(data) {
		var count = 0;
		var sum = 0;
		for (var i = 0; i < data.length; i += 1) {
			sum += parseInt(data[i]["price"]) * parseInt(data[i]["amount"]);
			count += parseInt(data[i]["amount"]);
		}

		pInfo.eq(0).text(count + ' шт.');
		pInfo.eq(1).text(sum + ' $');
		cartInfo.eq(0).text(count + ' шт.');
		cartInfo.eq(1).text(sum + ' $');
	}

	function getBasketData() {
		var regExp = /(?:basket\=)(.+?)(?=;|$)/g;
		var cookiData = document.cookie.match(regExp);
		var objStr;
		var obj;
		if (cookiData === null) {
			obj = [];
		} else {
			objStr = cookiData[0].replace(/basket\=/, '');
			obj = JSON.parse(objStr);
		}
		return obj;
	}

	function setBasketData(dataObj) {
		document.cookie = "basket=" + JSON.stringify(dataObj) + ";";
	}



	function indexOfBasket(basket, obj) {
		if (basket.length === 0) {
			return -1;
		}
		for (var i = 0; i < basket.length; i += 1) {
			if (basket[i].name === obj.name) {
				return i;
			}
		}
		return -1;
	}

	mediator.subscribe('sendToBasket', function(dataObj) {
		var position = indexOfBasket(basket, dataObj);
		var count;
		if (position === -1) {
			basket.push(dataObj);
		} else {

			count = parseInt(basket[position]["amount"]) + parseInt(dataObj["amount"]);

			if (parseInt(dataObj["quantity"]) > count) {
				basket[position]["amount"] = count;
			} else {
				basket[position]["amount"] = parseInt(dataObj["quantity"]);
			}
		}

		setBasketData(basket);
		mediator._publish('refreshData', basket);
	});

	mediator.subscribe('removeInBasket', function(dataObj) {
		var position = indexOfBasket(basket, dataObj);
		if (parseInt(basket[position]["amount"]) === parseInt(dataObj["amount"])) {
			basket.splice(position, 1);
		} else {
			basket[position]["amount"] = parseInt(basket[position]["amount"]) - parseInt(dataObj["amount"]);
		}
		setBasketData(basket);
		mediator._publish('refreshData', basket);
	});

})(cartMini, popup, generateContent, sortTable, Mediator);