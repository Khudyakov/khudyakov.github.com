/* ###########################
Проблему с морганием при ресайзинге фрейма решил путем введения дополнительного фрейма,
который выполняет роль "заглушки" и закрывает собой все моргания на время загрузки затребованного урла
Нашел интересный баг в хроме: у вставленного ифрейма c overwflow:hidden остаются полосы прокрутки
и прокручивание во фрейме можно убрать только установкой аттрибута srcrolling в no

Недостатки:
1) Работает только на главной странице habrahabr.ru
2) При быстрой смене урлов в активном фрейме есть вероятность, 
	что фрейм-заглушка может не успеть загрузиться
   ########################### */
'use strict';

$(function() {
	function getCoords(elem) {
		var box = elem.getBoundingClientRect();

		var body = document.body;
		var docElem = document.documentElement;

		var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

		var clientTop = docElem.clientTop || body.clientTop || 0;
		var clientLeft = docElem.clientLeft || body.clientLeft || 0;

		var top = box.top + scrollTop - clientTop;
		var left = box.left + scrollLeft - clientLeft;

		return {
			top: Math.round(top),
			left: Math.round(left)
		};
	}

	$('<style type=\'text/css\'> ' 
		+ '._contFrame{ overflow:hidden;}' 
		+ 'iframe::-webkit-scrollbar { display: none;}' 
		+ '._message { display: block; color:#999999;' 
		+ 'font-family:"Verdana", sans-serif; font-size:24px;' 
		+ 'background: #F0F0E7; padding: 20px; border-radius:10px}' 
		+ '._capFrame { position:absolute; visibility:hidden; overflow:hidden}' 
		+ '</style>').appendTo("head");
	// функция создания и добавления фреймов в основной блок страницы

	function addFrames(tabs) {
		tabs.each(function() {
			var frame = $(document.createElement('iframe'));
			frame.attr('src', this.href);
			frame.attr('scrolling', 'no');
			frame.css('visibility', 'hidden');
			frame.addClass('_contFrame');
			frame.appendTo(contentBlock);
		});
		$(document.createElement('iframe')).addClass('_capFrame').appendTo(document.body);
	}
	// позиционирование необходимого контента во фрейме

	function prepareFrame(currFrame, blockWidth, capTop, capLeft) {
		var frameDoc = currFrame.contents();
		var frameContent = frameDoc.find('.content_left');
		frameContent.width(blockWidth + 'px');
		var contHeight = frameContent.height();
		frameDoc.scrollTop(frameContent.position().top);
		frameDoc.scrollLeft(frameContent.position().left);
		currFrame.height(contHeight + 'px');
		currFrame.width(blockWidth + 'px');
		if (currFrame.hasClass('_capFrame')) {
			currFrame.css('top', capTop + 'px');
			currFrame.css('left', capLeft + 'px');
		}
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
					capFrame.attr('src', $(this).contents().get(0).location.href);
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
	var contBlockTop = getCoords(contentBlock.get(0)).top;
	var contBlockLeft = getCoords(contentBlock.get(0)).left;
	contentBlock.empty();

	var message = $(document.createElement('div')).addClass('_message');
	contentBlock.append(message);
	message.text('Content is loading now...Please wait');

	// создание фреймов и установка на странице
	var tabs = $('.main_menu a');
	addFrames(tabs);
	var frames = $('._contFrame');
	var capFrame = $('._capFrame');
	
	// по мере подгрузки фреймы поддаются ресайзингу и устанавливается активный фрейм
	frames.load(function() {
		var self = $(this);
		prepareFrame(self, blockWidth);
		
		
		$(self.contents().get(0).defaultView).unload(function() {
			capFrame.css('visibility', 'visible');
		});

		self.hide();
		self.css('visibility', 'visible');
		capFrame.css('visibility', 'hidden');
		var href = dataInCookie(tabs);
		if (self.attr('src') === href) {
			message.hide();
			capFrame.attr('src', self.contents().get(0).location.href);
			self.show();
		}
		tabs.each(function() {
			$(this).removeClass('active');
			if (this.href === href) {
				$(this).addClass('active');
			}
		});
	});

	capFrame.load(function() {
		prepareFrame($(this), blockWidth, contBlockTop, contBlockLeft);
		$(this).contents().on('click', '*', function(event) {
			event.preventDefault();
		})
	});
	addBehaviour(tabs, frames);
});