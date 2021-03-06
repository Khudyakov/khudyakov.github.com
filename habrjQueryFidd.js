﻿/* ##########################

Скрипт скрывает контент до момента когда все аяксы по загрузке страниц с темами
подгрузятся и обработаются.

Проверка на наличие конструктора jQuery проводится каждые 60мс, при появлении данной функции сбрасывается таймер
и редизайнится страница.

   ##########################  */

(function jQueryReady() {
	document.querySelector('html').style.visibility = 'hidden';
	var timer;
	if (window.jQuery) {
		clearTimeout(timer);
		$(function() {
			// Убрать блок рекламы в правой колонке
			$('.banner_300x500').remove();
			$('#htmlblock_placeholder').remove();

			//Убрать хабранавигатор
			$('.fast_navigator').remove();

			// Разделить прямой эфир на 2 отдельных блока (посты, qa) 
			var posts = $('.live_broadcast');
			var title = posts.find('.title').get(0).childNodes[0].textContent;
			var qa = $(document.createElement('div')).addClass('block').addClass('live_broadcast');
			qa.append(posts.find('.title').clone());

			qa.find('.title').text(title + '- ' + qa.find('.dotted.tab').eq(1).text());
			posts.find('.title').text(title + '- ' + posts.find('.dotted.tab').eq(0).text());

			qa.append(posts.find('.qa_activity').show());
			posts.after(qa);

			// Все блоки сделать collapsible
			$('.sidebar_right div .title').each(function() {
				$(this).next().hide();
			});

			$('.sidebar_right div .title').click(function() {
				$(this).next().slideToggle('slow');
			});

			$('.sidebar_right div .title').css('cursor', 'pointer');

			$('.sidebar_right div a').each(function() {
				if ($(this).hasClass('title')) {
					$(this).click(function(event) {
						event.preventDefault();
					});

				}
			});

			// Справа от каждой ссылки поста показать количество комментариев к посту
			$('.posts.shortcuts_items > div').each(function() {
				var comment = $(this).find('.comments .all');
				$(this).find('.title').append(comment);
			});

			// Убрать рейтинги, описание, флаги (Главная колонка)
			$('.posts.shortcuts_items > div > *').each(function() {
				if (($(this).hasClass('title') === false) && ($(this).hasClass('hubs') === false)) {
					$(this).remove();
				}
			});
			$('.flag').remove();

			//Подтянуть на страницу все посты в том-же формате с последующих страниц
			var pageNumber = parseInt($('#nav-pages > li:last-child').text());
			var url = $('#nav-pages > li:last-child a').get(0).href;
			var currentPage = 2;

			function getOtherPages() {
				var currentUrl = url.replace(/\d+/g, currentPage);
				currentPage += 1;
				$.get(currentUrl, function(data) {


					var body = document.createElement('body');
					body.innerHTML = data.match(/<body>[\s\S]*<\/body>/gim)[0];

					// Справа от каждой ссылки поста показать количество комментариев к посту
					$(body).find('.posts.shortcuts_items > div').each(function() {
						var comment = $(this).find('.comments .all');
						$(this).find('.title').append(comment);
					});

					// Убрать рейтинги, описание, флаги (Главная колонка)
					$(body).find('.posts.shortcuts_items > div > *').each(function() {
						if (($(this).hasClass('title') === false) && ($(this).hasClass('hubs') === false)) {
							$(this).remove();
						}
					});
					$(body).find('.flag').remove();

					$(body).find('.posts.shortcuts_items > div').appendTo($('.posts.shortcuts_items'));
					if (currentPage < pageNumber + 1) {
						getOtherPages();
					} else {
						$('.page-nav').remove();
						$('html').css('visibility', 'visible');
						return;
					}
				});
			}
			getOtherPages();
			
		});
	} else {
		timer = setTimeout(jQueryReady, 60);
	}
})();