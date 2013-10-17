'use strict';
/*  #########################

Обновил предидущую версию...
Теперь код работает по кнопке "MOSTRA", тоесть подгружаемый контент налету
обрабатывается дизайнером 
+ кнопка обновления данных "AGGIORNA QUOTE" и родное обновление данных по таймеру
не ломает верстку, а как полагается обновляет свежими данными таблицы

    #########################  */
(function() {
	function decorate(original, before, after, context) {
		return function() {
			context = context || this;
			var res;
			if (typeof before === 'function') {
				before.apply(context, arguments);
			}
			res = original.apply(context, arguments);
			if (typeof after === 'function') {
				after.apply(context, arguments);
			}
			return res;
		};
	}

	function modifyContent(url, obj) {
		var currTab = jQuery('#' + obj.id);
		reDesignContent(currTab.eq(0));
	}


	gotAjaxContent = decorate(gotAjaxContent, null, modifyContent);

	function modifyCont() {

		var currTab = jQuery('.tabCnt:visible');
		reDesignContent(currTab.eq(0));
	}


	_lb_fb_cpn_got_ajax_content = decorate(_lb_fb_cpn_got_ajax_content, null, modifyCont);

	function reDesignContent(currentTab) {

		// добавление собственных стилей для создаваемых элементов

		jQuery('<style type=\'text/css\'> ' 
			+ '._topPosition { vertical-align:top;}' 
			+ '._linkTitle div{ color: #197CAF; font-weight:bold;' 
			+ 'height:25px; line-height:25px; font-size:10px;}' 
			+ '._messages div { color: #197CAF; font-weight:normal;' 
			+ 'height:25px; line-height:25px; text-align:left;}' 
			+ '</style>').appendTo("head");


		// убираем сортировочные ссылки в шапке, запоминая содержимый текст


		function reDesignTable(table) {
			var infoRows = table.find('tbody > tr');
			var colgroup = table.find('colgroup');
			var columnsWidth = colgroup.find('col');
			// смена ширины колонок для нашей раметки
			columnsWidth.eq(0).css('width', '45px');
			columnsWidth.eq(1).css('width', '150px');
			columnsWidth.eq(2).css('width', '20px');
			columnsWidth.eq(3).css('width', '25px');
			columnsWidth.eq(4).css('width', '55px');
			columnsWidth.eq(5).css('width', '115px');
			columnsWidth.eq(6).css('width', '9px');
			columnsWidth.eq(7).css('width', '64px');
			// обработка имеющихся в таблице строк
			infoRows.each(function() {
				var row = jQuery(this);
				reDesignRow(row, links);
			});

		}

		function reDesignRow(row, links) {
			row.find('td:not([id])').css('vertical-align', 'top');
			var designedCells = row.find('td[id]');
			designedCells.eq(0).addClass('_linkTitle');
			designedCells.eq(2).addClass('_messages');
			// перемещение кнопок
			var midButton = designedCells.eq(1).find('div');

			if (midButton.length === 1) {
				designedCells.eq(0).find('div').insertBefore(midButton);
				designedCells.eq(2).find('div').insertAfter(midButton);

				// добавление текста ссылок

				for (var link in links) {
					designedCells.eq(0).append('<div>' + links[link] + '</div>');
				}

				// добавление сообщений о возможном выигрыше
				var rates = designedCells.eq(1).find('div');

				rates.each(function() {
					var rate = parseFloat(jQuery(this).find('span').text()) * 20;
					var message = 'gioca €20 vinci €' + Math.floor(rate);
					designedCells.eq(2).append('<div>' + message + '</div>');
				});

			}
		}

		var timeTables = currentTab.find('.footballcard');
		var links;
		var sortLinks = timeTables.eq(0).find('th[id] a');
		links = {
			'1': sortLinks.eq(1).hide().text(),
			'2': sortLinks.eq(2).hide().text(),
			'3': sortLinks.eq(3).hide().text()
		}

		for (var i = 1; i < timeTables.length; i += 1) {
			reDesignTable(timeTables.eq(i));
		}
	}
})();