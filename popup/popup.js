/*   #############################
	Недостатки реализации:
	1) При ресайзинге окна контент в попапе не сохраняет пропорции

	 #############################  */

'use strict';
var popupPlagin = (function($) {
	// создание класса обьекта кэша, содержащего узлы, вставляемые в попап и их свойства
	var Sealer = (function() {
		var objects = [];
		var options = [];

		function Sealer() {
			this.length = 0;
		}

		Sealer.prototype.set = function(object, option) {
			objects.push(object);
			options.push(option);
			this.length += 1;
		}

		Sealer.prototype.get = function(index) {
			return {
				object: objects[index],
				option: options[index]
			}
		}
		Sealer.prototype.setOption = function(index, option) {
			options[index] = option;
		}

		Sealer.prototype.indexOf = function(object) {
			if (objects.length === 0) {
				return -1;
			}
			for (var i = 0; i < objects.length; i += 1) {
				if (objects[i].get(0) === object.get(0)) {
					return i;
				}
			}
			return -1;
		}

		return Sealer;
	})();


	var Popup = (function() {

		function prepareContentSize(nodeObj, padding, options) {
			var childrens = nodeObj.find('*');
			if (options.maxWidth + padding * 2 > $(window).width()) {
				nodeObj.width($(window).width() - padding * 2);
				if (childrens.length !== 0) {
					childrens.each(function() {
						$(this).width($(window).width() - padding * 2);
					});
				}
			} else {
				if (nodeObj.width() < options.maxWidth) {
					nodeObj.width(options.maxWidth);
					if (childrens.length !== 0) {
						childrens.each(function() {
							$(this).width(options.maxWidth);
						})
					}
				}
			}


			if (options.maxHeight + padding * 2 > $(window).height()) {
				nodeObj.height($(window).height() - padding * 2);
				if (childrens.length !== 0) {
					childrens.each(function() {
						$(this).height($(window).height() - padding * 2);
					})
				}
			} else {
				if (nodeObj.height() < options.maxHeight) {
					nodeObj.height(options.maxHeight);
					if (childrens.length !== 0) {
						childrens.each(function() {
							$(this).height(options.maxHeight);
						})
					}
				}
			}
		}


		function positioningPopup(popupObj, padding) {
			var popupObjTop = $(window).height() / 2 - popupObj.height() / 2 - padding;
			var popupObjLeft = $(window).width() / 2 - popupObj.width() / 2 - padding;
			return {
				top: popupObjTop,
				left: popupObjLeft
			}

		}


		var instance;
		// Определение конструктора попапа-синглтона

		function Popup(cashObj) {
			if (instance) {
				if (cashObj) {
					instance.current = 0;
					instance.cash = cashObj;
					instance.createPopup();
				}
				return instance;
			}
			if (this && this.constructor === Popup) {
				if (cashObj) {
					this.current = 0;
					this.cash = cashObj;
					this.createPopup();
				}
				instance = this;
			} else {
				return new Popup(cashObj);
			}

		}
		// создание разметки попапа и наполнение его узлами с установкой опций в кэше
		Popup.prototype.createPopup = function() {

			$('.__popup_wrap').remove();
			this.popupWrap = $('<div></div>').addClass('__popup_wrap');
			this.popupWindow = $('<div></div>').addClass('__popup');

			var self = this;
			self.animateFrom = "center";
			self.popupWindow.appendTo(self.popupWrap);
			$('<span></span>').addClass('__info').appendTo(self.popupWindow);
			$('<span>X</span>').addClass('__close_butt').appendTo(self.popupWindow);
			$('<span>&#8249; </span>').addClass('__arrow').addClass('__left-arrow').appendTo(self.popupWindow);
			$('<span>&#8250; </span>').addClass('__arrow').addClass('__right-arrow').appendTo(self.popupWindow);

			for (var i = 0; i < self.cash.length; i += 1) {
				var content = self.cash.get(i).object.clone();
				content.addClass('__content');
				var standartOptions = {
					maxWidth: self.cash.get(i).object.width(),
					maxHeight: self.cash.get(i).object.height(),
					animationFrom: "center"
				}

				if (self.cash.get(i).option) {

					self.cash.setOption(i, $.extend(standartOptions, self.cash.get(i).option));

					var optionObj = self.cash.get(i).option;
					if (optionObj["animationFrom"] === "click") {
						self.cash.get(i).object.click(function() {
							self.showContent(self.cash.indexOf($(this)));
						});
					}

				} else {
					self.cash.setOption(i, standartOptions);
				}

				self.popupWindow.append(content);
			}

			$('body').append(self.popupWrap);
			self.addBehaviour();

		}
		// метод отображения контента в попапе по индексу
		Popup.prototype.showContent = function(position) {
			var self = this;
			this.current = position;
			this.popupWindow.find('.__info').text('№ ' + (position + 1));
			var popupPadding = parseInt(this.popupWindow.css('padding-top').replace(/px/g, ''));
			var currContent = this.popupWrap.find('.__content').eq(position);
			var realContent = this.cash.get(this.current).object;

			this.popupWrap.find('.__content').hide();

			if (!this.popupWrap.is(':visible')) {
				self.popupWindow.css('visibility', 'hidden');
				this.popupWrap.show().css('opacity', '0').animate({
					opacity: 1.0
				}, "slow", function() {
					currContent.show();
					prepareContentSize(currContent, popupPadding, self.cash.get(self.current).option);
					self.popupWindow.css('visibility', 'visible');
					if (self.cash.get(position).option.animationFrom === "click") {
						self.popupWindow.css({
							'top': realContent.offset().top - $(window).scrollTop() + 'px',
							'left': realContent.offset().left - $(window).scrollLeft() + 'px'
						}).animate({
							'top': positioningPopup(self.popupWindow, popupPadding).top,
							'left': positioningPopup(self.popupWindow, popupPadding).left
						}, "slow");
					} else {
						self.popupWindow.css('top', positioningPopup(self.popupWindow, popupPadding).top + 'px');
						self.popupWindow.css('left', positioningPopup(self.popupWindow, popupPadding).left + 'px');
					}

				});
			} else {
				currContent.show();
				prepareContentSize(currContent, popupPadding, self.cash.get(self.current).option);
				this.popupWindow.css('top', positioningPopup(this.popupWindow, popupPadding).top + 'px');
				this.popupWindow.css('left', positioningPopup(this.popupWindow, popupPadding).left + 'px');
			}

		}

		Popup.prototype.close = function() {
			this.popupWrap.hide();
		}
		// добавление обработчиков на элементы попапа и на окно
		Popup.prototype.addBehaviour = function() {
			var self = this;
			var popupPadding = parseInt(this.popupWindow.css('padding-top').replace(/px/g, ''));


			this.popupWindow.find('.__left-arrow').click(function() {
				if ((self.current - 1) > -1) {
					self.showContent(self.current - 1);
				}
			});
			this.popupWindow.find('.__right-arrow').click(function() {
				if ((self.current + 1) < self.cash.length) {
					self.showContent(self.current + 1);
				}
			});

			this.popupWrap.click(function(event) {
				if ($(event.target).hasClass('__popup_wrap') || $(event.target).hasClass('__close_butt') || $(event.target).hasClass('popup-close')) {
					self.close();
				}
			});

			$(window).keyup(function(event) {
				if (event.keyCode === 27) {
					self.close();
				}
			});

			$(window).resize(function() {
				var currContent = self.popupWrap.find('.__content').eq(self.current);

				prepareContentSize(currContent, popupPadding, self.cash.get(self.current).option);
				self.popupWindow.css('top', positioningPopup(self.popupWindow, popupPadding).top + 'px');
				self.popupWindow.css('left', positioningPopup(self.popupWindow, popupPadding).left + 'px');
			});

		}

		return Popup;

	})();

	var cash = new Sealer();

	$.fn.makePopup = function(options) {
		cash.set(this, options);
		var refreshingPopup = new Popup(cash);
	}

	$.fn.openPopup = function() {
		var position = cash.indexOf(this);
		var popupObj = new Popup();
		if (position !== -1) {
			popupObj.showContent(position);
		}
	}

	$.fn.closePopup = function() {
		var popupObj = new Popup();
		popupObj.close();
	}

})(jQuery);