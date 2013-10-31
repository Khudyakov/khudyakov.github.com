'use strict';
/* TOOLS */

function addClass(node, className) {
	if ((node) && (className)) {
		var classArr = node.className.split(' ');

		if (Object.prototype.toString.call(className) !== '[object Array]') {
			className = className.split(' ');
		}
	
		className = className.filter(function(iArr) {
			return classArr.indexOf(iArr) === -1;
		});
		className.forEach(function(iArr) {
			classArr.push(iArr);
		});

		node.className = classArr.join(' ');

	}

}

function removeClass(node, className) {
	if ((node) && (className)) {
		var classArr = node.className.split(' ');
		if (Object.prototype.toString.call(className) !== '[object Array]') {
			className = className.split(' ');
		}
		classArr = classArr.filter(function(iArr) {
			return className.indexOf(iArr) === -1;
		});

		node.className = classArr.join(' ');
	}
}

function hasClass(node, className) {
	if ((node) && (className)) {
		var classArr = node.className.split(' ');
		if (Object.prototype.toString.call(className) !== '[object Array]') {
			className = className.split(' ');
		}
		return className.every(function(iarr) {
			if (classArr.indexOf(iarr) > -1) {
				return true;
			} else {
				return false;
			}
		});
	}
}

function bind(obj, event_name, handler) {
	var handler_wrapper = function(event) {
		event = event || window.event;
		if (!event.target && event.srcElement) {
			event.target = event.srcElement;
		}
		return handler.call(obj, event);
	};

	if (obj.addEventListener) {
		obj.addEventListener(event_name, handler_wrapper, false);
	} else if (obj.attachEvent) {
		obj.attachEvent('on' + event_name, handler_wrapper);
	}
	return handler_wrapper;
}

/* Creating class Slider */
var Gallery = (function() {
	var currentSlider = undefined;
	var DOUBLE_MARGIN = 4
	var KEY_RIGHT = 39;
	var KEY_LEFT = 37;
	// Смена изображений и при нажатии стрелок на клавиатуре
	var keyDown = function(event) {
		if (event.keyCode === KEY_RIGHT) {
			currentSlider.next();
		}
		if (event.keyCode === KEY_LEFT) {
			currentSlider.back();
		}
	}

	bind(document, 'keydown', keyDown);

	function Slider(sliderNode) {
		this.domNodes = sliderNode;
		this.ul = sliderNode.querySelector('.previews');
		this.imgs = this.ul.querySelectorAll('li');
		this.frame = this.domNodes.querySelector('.frame');
		this.bigImg = sliderNode.querySelector('.big-picture img');
		this.timer = undefined;
		this.imgWidth = this.imgs[0].offsetWidth + DOUBLE_MARGIN;
		this.frameWidth = this.frame.offsetWidth;
		this.imgCount = Math.round(this.frameWidth / this.imgWidth);
		this.position = 0;
		this.leftArrowNode = sliderNode.querySelector('.left-arrow');
		this.rightArrowNode = sliderNode.querySelector('.right-arrow');
		this.setTimer();
		this.setCurrent();
		var self = this;
		var bigImageQ = document.createElement('img');
		bigImageQ.src = this.imgs[1].querySelector('img').getAttribute('bigPic');
		this.bigImageQ = bigImageQ;

		var clicked = function(event) {
			currentSlider = self;
			// Обработка события нажатия на стрелки карусели
			if (hasClass(event.target, 'arrow')) {
				if (hasClass(event.target, 'left-arrow')) {
					currentSlider.backFrame();
				}
				if (hasClass(event.target, 'right-arrow')) {
					currentSlider.nextFrame();
				}

			}
			// Обработка события нажатия на превью и остановка таймера
			if (event.target.hasAttribute('bigPic')) {
				currentSlider.show(event.target);
				clearInterval(currentSlider.timer);
				self.setTimer();

			}

		}

		bind(this.domNodes, 'click', clicked);

		// Установка текущего слайдера при наведении
		var mouseOvered = function(event) {
			removeClass(currentSlider.domNodes,'curr');
			currentSlider = self;
			addClass(currentSlider.domNodes,'curr');
		}

		bind(this.domNodes, 'mouseenter', mouseOvered);

	}

	Slider.prototype.setCurrent = function() {
		if (currentSlider === undefined) {
			currentSlider = this;
			addClass(this.domNodes,'curr');
		}

	}

	Slider.prototype.setTimer = function() {
		var self = this;
		this.timer = setInterval(function() {
			self.next();
		}, 5000);
	}
	// Метод переключения фреймов карусели вперед
	Slider.prototype.nextFrame = function() {
		var ul = this.ul;
		var imgs = this.imgs;
		var self = this;

		if (this.position >= -this.imgWidth * (imgs.length - this.imgCount)) {
			this.position = Math.max(this.position - this.frameWidth, -this.imgWidth * (imgs.length - this.imgCount));
			$(ul).animate({
				marginLeft: self.position + "px"
			}, 1500);

			removeClass(this.leftArrowNode, 'mark');
			if (this.position === -this.imgWidth * (imgs.length - this.imgCount)) {
				addClass(this.rightArrowNode, 'mark');
			}
		}
	}
	// Метод переключения фреймов карусели назад
	Slider.prototype.backFrame = function() {
		var ul = this.ul;
		var imgs = this.imgs;
		var self = this;
		if (this.position <= 0) {
			this.position = Math.min(this.position + this.frameWidth, 0);
			$(ul).animate({
				marginLeft: self.position + "px"
			}, 1500);
	

			removeClass(this.rightArrowNode, 'mark');
			if (this.position === 0) {
				addClass(this.leftArrowNode, 'mark');
			}
		}
	}
	// Метод переключения превью вперед
	Slider.prototype.next = function() {
		var currentImg = this.ul.querySelector('.current');
		var index;
		for (var i = 0; i < this.imgs.length; i += 1) {
			if (currentImg === this.imgs[i]) {
				index = i;
			}
		}

		if (index === (this.imgs.length - 1)) {
			this.show(this.imgs[0].querySelector('img'));
			this.ul.style.marginLeft = 0;
			addClass(this.leftArrowNode, 'mark');
			removeClass(this.rightArrowNode, 'mark');
		} else {
			this.show(this.imgs[index + 1].querySelector('img'));
			if (this.imgs[index+2]) {
			this.bigImageQ.src = this.imgs[index+2].querySelector('img').getAttribute('bigPic');
		}
		}
	}
	// Метод переключения превью назад
	Slider.prototype.back = function() {
		var currentImg = this.ul.querySelector('.current');
		var index;
		var imgSet = this.imgs.length - this.imgCount;
		for (var i = 0; i < this.imgs.length; i += 1) {
			if (currentImg === this.imgs[i]) {
				index = i;
			}
		}

		if (index === 0) {
			this.show(this.imgs[this.imgs.length - 1].querySelector('img'));
			this.ul.style.marginLeft = (-this.imgWidth * imgSet) + 'px';
			addClass(this.rightArrowNode, 'mark');
			removeClass(this.leftArrowNode, 'mark');
		} else {
			this.show(this.imgs[index - 1].querySelector('img'));
		}
	}
	// Метод отображения большого изображения по переданному узлу малого изображения
	Slider.prototype.show = function(node) {
		var self = this;
		$(this.bigImg).fadeTo('fast', 0.2, function() {
			self.bigImg.src = node.getAttribute('bigPic');
			$(self.bigImg).fadeTo('fast', 1.0);
		});



		for (var i = 0; i < this.imgs.length; i += 1) {
			removeClass(this.imgs[i], 'current');
		}
		addClass(node.parentNode, 'current');
	}
	return Slider;
})();

/* Initialize */

var slidersNode = document.querySelectorAll('.gal');
// Создание объектов
for (var i = 0; i < slidersNode.length; i += 1) {
	var sliderObj = new Gallery(slidersNode[i]);
}