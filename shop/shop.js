/*  ##############################
	Обновление: отремонтировал сортировку в таблице корзины
	Недостатки реализации:
	1) Не учел возможное переполнение куки при записи содержимого корзины

	Главный модуль содержит:
	1) Медиатор
	2) Глобальная функция генерации таблицы из обьекта данных (generateContent)
	3) Глобальная функция навешивания сортировки на таблицу (sortTable)
	4) Глобальные переменные с основными узлами ДОМ

   ############################### */

var Mediator = (function() {
	'use strict';
	var events;
	var instance;

	events = {};

	instance = {
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

		_publish: function(event_name, data) {
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

	return function() {
		return instance;
	}
}());

var generateContent = (function() {

	function generateCont(header, contNode, data, mediator) {
		contNode.empty();
		for (var i = 0; i < data.length; i += 1) {
			var row = $(document.createElement('tr'));
			for (var j = 0; j < header.length; j += 1) {
				var dataType = header.eq(j).attr('dataType');
				var cell = $(document.createElement('td'));
				if (dataType in data[i]) {
					cell.text(data[i][dataType]);
				} else {
					var input = $(document.createElement('input'));
					input.attr('type', 'text').attr('name', 'pole').attr('size', '2').css('width', '30px');
					input.val(1);
					cell.append(input);

					var button = $(document.createElement('span'));
					button.addClass('butn');
					button.text(header.eq(j).text());

					addBehaviour(data[i], dataType, button, input, mediator);
					cell.append(button);
				}
				row.append(cell);
			}
			contNode.append(row);
		}
	}

	function addBehaviour(obj, dataType, button, input, mediator) {
		if (dataType === "buy") {
			var quantity = parseInt(obj["quantity"]);

			input.on('keyup', function() {
				var self = $(this);
				if ((/\D/.test(self.val())) || (parseInt(self.val()) < 1)) {
					self.val(1);
				} else {
					if (parseInt(self.val()) > quantity) {
						self.val(quantity);
					}
				}
			})

			input.on('blur', function() {
				if ($(this).val() === "") {
					$(this).val(1);
				}
			});

			button.on('click', function(event) {
				var cartObj = {};
				for (var key in obj) {
					cartObj[key] = obj[key];
				}
				cartObj["amount"] = input.val();
				mediator._publish('sendToBasket', cartObj);
			});

		} else {
			if (dataType === "remove") {
				var amount = parseInt(obj["amount"]);

				input.on('keyup', function() {
					var self = $(this);
					if ((/\D/.test(self.val())) || (parseInt(self.val()) < 1)) {
						self.val(1);
					} else {
						if (parseInt(self.val()) > amount) {
							self.val(amount);
						}
					}
				})

				input.on('blur', function() {
					if ($(this).val() === "") {
						$(this).val(1);
					}
				});

				button.on('click', function(event) {
					var cartObj = {};
					for (var key in obj) {
						cartObj[key] = obj[key];
					}
					cartObj["amount"] = input.val();
					mediator._publish('removeInBasket', cartObj);
				});
			}
		}
	}

	return generateCont;
})();


var sortTable = (function() {

	var getComparator = function(sortName) {
		var comparator = function(a, b) {
			if (a[sortName] > b[sortName]) {
				return 1;
			} else {
				if (a[sortName] < b[sortName]) {
					return -1;
				} else {
					return 0;
				}
			}
		}
		return comparator;
	}

		function sortTable(currHeader, data, sortName, tabContent, mediator) {
			var header = tabContent.find('thead th');
			var content = tabContent.find('tbody');
			if (currHeader.hasClass('az')) {
				data.sort(getComparator(sortName)).reverse();
				generateContent(header, content, data, mediator);
				currHeader.removeClass('az');
			} else {
				data.sort(getComparator(sortName));
				generateContent(header, content, data, mediator);
				header.removeClass('az');
				currHeader.addClass('az');
			}
		}
	return sortTable;
})();

var navPanel = $('.catalog');
var loader = $('.loader');
var goodsCont = $('.content .goods');
var cartMini = $('.basket');
var popup = $('.popup_wrap');
var slider = $('.slider');
var firmBox = $('.ff_body');