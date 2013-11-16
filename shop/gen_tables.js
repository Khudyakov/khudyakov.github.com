'use strict';
/*   ################################

	Модуль работы с главной таблицей контента:
	1) Подпись на событие готовности данных через аякс и 
	вызов генерирущей таблицы глобальной функции

	 ################################ */
var getTablesModule = (function (goodsCont, Mediator, generateContent, sortTable) {
	var mediator = new Mediator();
	var content = goodsCont.find('tbody');
	var header = goodsCont.find('thead th');
	var sortHeaders = goodsCont.find('.sort');

	var initTable = function(data) {
		sortHeaders.off('click');
		sortHeaders.on('click', function() {
			var self = $(this);
			sortTable(self, data, self.attr('dataType'), goodsCont, mediator);
		});

		generateContent(header, content, data, mediator);

	}

	mediator.subscribe('dataReady', initTable);
	mediator.subscribe('filter',initTable);

})(goodsCont, Mediator, generateContent, sortTable);