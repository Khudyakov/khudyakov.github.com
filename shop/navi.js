'use strict';
/*   ################################

	Модуль работы с навигацией:
	1) Получение из урла последней открытой вкладки
	2) Навешивание обработчиков на пункты меню каталога товаров
	3) Подгрузка данных через аякс по имени группы товаров

	 ################################ */

var navigationModule = (function(navPanel, loader, docum, Mediator) {
	var mediator = new Mediator();
	var groups = navPanel.find('li');
	setCurrentTab(getCurrTab(groups), groups);

	navPanel.on('click', 'li', function(event) {
		event.preventDefault();
		setCurrentTab($(this), groups);
	});

	function setCurrentTab(tabNode, tabs) {
		tabs.removeClass('active');
		tabNode.addClass('active');
		var thisGroup = tabNode.find('a');
		docum.location = '#' + thisGroup.attr('href');
		loader.show();
		getAjaxContent(thisGroup.attr('href'));
	}

	function getCurrTab(groups) {
		var regExp = /\#\w+/g;
		var location = docum.location.href;
		var linkHref = location.match(regExp);
		var currTab;

		if (linkHref === null) {
			currTab = groups.eq(0);
		} else {
			var href = linkHref[0].replace(/\#/g, '');

			groups.each(function() {
				var link = $(this).find('a');
				if (link.attr('href') === href) {
					currTab = $(this);
				}
			});
		}
		return currTab;
	}

	function getAjaxContent(catName) {
		var url = "database/" + catName + ".json";
		var request = $.ajax({
			url: url,
			type: "GET",
			dataType: "json",
		});

		request.done(function(obj) {
			loader.hide();
			mediator._publish('dataReady', obj);
		});
	}

})(navPanel, loader, document, Mediator);