/* ###########################
Нашел интересный баг в хроме: у вставленного ифрейма c overwflow:hidden остаются полосы прокрутки
и прокручивание во фрейме можно убрать только установкой аттрибута srcrolling в no

Недостатки:
1) Работает только на главной странице habrahabr.ru

   ########################### */
'use strict';

$(function() {
	$('<style type=\'text/css\'> ' + '._contFrame{ overflow:hidden;}'
		+'iframe::-webkit-scrollbar { display: none; }'
		+ '</style>').appendTo("head");
	// функция создания и добавления фреймов в основной блок страницы

	function addFrames(tabs) {
		tabs.each(function() {
			var frame = $(document.createElement('iframe'));
			frame.attr('src', this.href);
			frame.attr('scrolling','no');
			frame.addClass('_contFrame');
			frame.appendTo(contentBlock);
		});
	}
	// позиционирование необходимого контента во фрейме

	function prepareFrame(currFrame, blockWidth) {
		var frameDoc = currFrame.contents();
		var frameContent = frameDoc.find('.content_left');
		frameContent.width(blockWidth + 'px');
		var contHeight = frameContent.height();
		frameDoc.scrollTop(frameContent.position().top);
		frameDoc.scrollLeft(frameContent.position().left);
		currFrame.height(contHeight + 'px');
		currFrame.width(blockWidth + 'px');
	}
	// добавление обработчика по клику на пункты меню

	function addBehaviour(links, contents) {
		links.on('click', function(event) {
			event.preventDefault();
			document.cookie = 'currTab=' + this.href;
			var currLink = $(this);

			//перезагрузка содежимого активного фрейма при активном табе
			if (currLink.hasClass('active')) {
				contents.each(function() {
					if ($(this).attr('src') === currLink.attr('href')) {
						$(this).attr('src', currLink.attr('href'));
					}
				});
			}

			links.removeClass('active');
			currLink.addClass('active');
			contents.hide();
			// показ соответсвующего фрейма по нажатию на таб
			contents.each(function() {
				if ($(this).attr('src') === currLink.attr('href')) {
					$(this).show();
				}
			});
		});
	}
	// проверка наличия урла по последнему активному табу в куках
	// если инфы нет, то активным урлом становится урл активного таба

	function dataInCookie(tabs) {
		var href;
		href = document.cookie.match(/(?:currTab)(.+?)(?=;|$)/g);
		if (href === null) {
			tabs.each(function() {
				if ($(this).hasClass('active')) {
					href = this.href;
				}
			});
		} else {
			href = href[0].replace(/currTab\=/g, '');
		}
		return href;
	}
	// получение размеров стандартного блока и очистка его содержимого
	var contentBlock = $('.content_left');
	var blockWidth = contentBlock.width();
	contentBlock.empty();

	// создание фреймов и установка на странице
	var tabs = $('.main_menu a');
	addFrames(tabs);
	var frames = $('._contFrame');

	// по мере подгрузки фреймы поддаются ресайзингу и устанавливается активный фрейм
	frames.load(function() {
		prepareFrame($(this), blockWidth);
		$(this).hide();
		var href = dataInCookie(tabs);
		if ($(this).attr('src') === href) {
			$(this).show();
		}
		tabs.each(function() {
			$(this).removeClass('active');
			if (this.href === href) {
				$(this).addClass('active');
			}
		});
	});

	addBehaviour(tabs, frames);
});