'use strict';
/*   ################################

	Модуль работы с корзиной (мини-инфо корзины и поп-ап):
	1) Обсервер, раздающий данные на таблицу и инфо-окошки при изменении обьекта корзины
	2) Навешивание обработчиков на поп-ап и мини-инфо корзины
	3) Подписывание функций в медиаторе на события кнопок таблицы "купить" и "удалить", которые
		изменяют обьект корзины
	4) Вспомогательные функции записи и чтения куки

	 ################################ */
(function() {
	function Observer() {
		this.subscribers = [];
	}


	Observer.prototype.subscribe = function(handler) {
		this.subscribers.push(handler);
	};


	Observer.prototype.unsubscribe = function(handler) {
		this.subscribers = this.subscribers.filter(function(subscriber) {
			return subscriber !== handler;
		});
	};


	Observer.prototype._trigger = function() {
		var args = arguments;
		this.subscribers.forEach(function(subscriber) {
			subscriber.apply(undefined, args);
		});
	};

	var observ = new Observer();
	var mediator = new Mediator();
	var basket = getBasketData();
	var basketContent = popup.find('.goods tbody');
	var basketHeader = popup.find('.goods thead th');
	var sortHeaders = popup.find('.sort');
	var pInfo = popup.find('.pinfo span');
	var cartInfo = cartMini.find('span');
	var clearButton = popup.find('.clear');

	cartMini.on('click', function() {
		popup.show();
	});

	popup.on('click', function(event) {
		self = $(event.target);
		if (self.hasClass('popup_wrap') || self.hasClass('close')) {
			popup.hide();
		}
	});

	clearButton.on('click',function(event) {
		event.preventDefault();
		basket = [];
		setBasketData(basket);
		observ._trigger(basket);
		popup.hide();
	})

	observ.subscribe(refreshCartTab);
	observ.subscribe(refreshCartInfo);
	observ._trigger(basket);


	function refreshCartTab(data) {
		sortHeaders.off('click');
		sortHeaders.on('click', function() {
			var self = $(this);
			sortTable(self, data, self.attr('dataType'), basketContent, mediator);
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
		observ._trigger(basket);
	});

	mediator.subscribe('removeInBasket', function(dataObj) {
		var position = indexOfBasket(basket, dataObj);
		if (parseInt(basket[position]["amount"]) === parseInt(dataObj["amount"])) {
			basket.splice(position, 1);
		} else {
			basket[position]["amount"] = parseInt(basket[position]["amount"]) - parseInt(dataObj["amount"]);
		}
		setBasketData(basket);
		observ._trigger(basket);
	});

})(cartMini, popup, generateContent, sortTable, Mediator, document.cookie);