'use strict';

var initSlider = (function(slider, Mediator) {
	var mediator = new Mediator();
	var info = slider.find('.sl_info');
	var slBody = slider.find('.sl_body');
	var dataObj;

	mediator.subscribe('onChange', function(option) {
		var filterData = dataObj.filter(function(iArr) {
			return ((iArr.price >= option.min) && (iArr.price <= option.max));
		});
		mediator._publish('filter', filterData);
	});


	mediator.subscribe('onSlide', function(option) {
		info.text('$' + option.min + ' - $' + option.max);
	});

	mediator.subscribe('dataReady', function(data) {
		var price = [];
		var option = {};
		dataObj = data;
		for (var i = 0; i < data.length; i += 1) {
			price.push(data[i]["price"]);
		}
		price.sort(function(a, b) {
			if (a > b) return 1;
			if (a < b) return -1;
		});

		option.max = price[price.length - 1];
		option.min = price[0];
		mediator._publish('onSlide', option);
		var sl = new Slider(slBody, option);
	});

	var Slider = (function(mediator) {

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

		/* Constructor Slider */
		var Slider = function(domNode, option) {
			this.slider = domNode;
			this.option = option;
			this.factor = Math.floor((option.max - option.min) / 100);
			this.mark1 = domNode.find('.mark1');
			this.mark2 = domNode.find('.mark2');
			this.sliderWidth = this.slider.outerWidth() - this.mark2.outerWidth();
			this.mark1.css('left', '0');
			this.mark2.css('left', this.slider.outerWidth() - this.mark2.outerWidth() + 'px');
			this.mark1Value = option.min;
			this.mark2Value = option.max;
			this.mark1Position = 0;
			this.mark2Position = this.sliderWidth;
			this.mark1.off('mousedown');
			this.mark2.off('mousedown');
			this.addBehavior();
		}

		Slider.prototype.addBehavior = function() {
			var self = this;

			this.mark1.on('dragstart', function(event) {
				event.preventDefault();
			});


			this.mark2.on('dragstart', function(event) {
				event.preventDefault();
			});

			var mousedownHandler1 = function(event) {

				event.preventDefault();

				var markCoords = getCoords(self.mark1.get(0));
				var sliderCoords = getCoords(self.slider.get(0));
				var shiftX = event.pageX - markCoords.left;
				var shiftY = event.pageY - markCoords.top;

				$(document).on('mousemove', function(event) {
					self.mark1Position = event.pageX - shiftX - sliderCoords.left;
					if (self.mark1Position < 0) {
						self.mark1Position = 0;
					}
					//var rightEdge = self.slider.outerWidth() - self.mark1.outerWidth();
					if (self.mark1Position > self.mark2Position) {
						self.mark1Position = self.mark2Position;
						self.mark1.css('z-index', '1');
					}
					self.mark1.css('left', self.mark1Position + 'px');
					if (Math.round(self.mark1Position / self.sliderWidth * 100) === 100) {
						self.mark1Value = self.option.max;
					} else {
						self.mark1Value = self.option.min + Math.round(self.mark1Position / self.sliderWidth * 100) * self.factor;
					}
					mediator._publish('onSlide', {
						"min": self.mark1Value,
						"max": self.mark2Value
					});
				});

				$(document).on('mouseup', function(event) {
					mediator._publish('onChange', {
						"min": self.mark1Value,
						"max": self.mark2Value
					});
					self.mark1.css('z-index', '20');
					$(document).off('mousemove');
					$(document).off('mouseup');

				});
			}

			this.mark1.on('mousedown', mousedownHandler1);


			var mousedownHandler2 = function(event) {
				event.preventDefault();

				var markCoords = getCoords(self.mark2.get(0));
				var sliderCoords = getCoords(self.slider.get(0));
				var shiftX = event.pageX - markCoords.left;
				var shiftY = event.pageY - markCoords.top;

				$(document).on('mousemove', function(event) {
					self.mark2Position = event.pageX - shiftX - sliderCoords.left;
					if (self.mark2Position < self.mark1Position) {
						self.mark2Position = self.mark1Position;
					}
					var rightEdge = self.slider.outerWidth() - self.mark1.outerWidth();
					if (self.mark2Position > rightEdge) {
						self.mark2Position = rightEdge;
					}
					self.mark2.css('left', self.mark2Position + 'px');

					if (Math.round(self.mark2Position / self.sliderWidth * 100) === 100) {
						self.mark2Value = self.option.max;
					} else {
						self.mark2Value = self.option.min + Math.round(self.mark2Position / self.sliderWidth * 100) * self.factor;
					}
					mediator._publish('onSlide', {
						"min": self.mark1Value,
						"max": self.mark2Value
					});
				});

				$(document).on('mouseup', function(event) {
					mediator._publish('onChange', {
						"min": self.mark1Value,
						"max": self.mark2Value
					});
					$(document).off('mousemove');
					$(document).off('mouseup');

				});
			}

			this.mark2.on('mousedown', mousedownHandler2);

		}

		return Slider;

	})(mediator);

})(slider, Mediator);