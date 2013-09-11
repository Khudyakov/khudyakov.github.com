'use strict';
/* TOOLS */

function addClass(node, className) {
	if ((node) && (className)) {
		var classArr = node.className.split(' ');

		// className в случае если это строка, переводится к массиву
		if (Object.prototype.toString.call(className) !== '[object Array]') {
			className = className.split(' ');
		}
		//Отбираем классы, которых нет в className узла
		className = className.filter(function(iArr) {
			return classArr.indexOf(iArr) === -1;
		});
		// добавляем отобранные ранее класы к массиву классов узла
		className.forEach(function(iArr) {
			classArr.push(iArr);
		});

		node.className = classArr.join(' ');

	}

}

function removeClass(node, className) {
	if ((node) && (className)) {
		var classArr = node.className.split(' ');
		// className в случае если это строка, переводится к массиву
		if (Object.prototype.toString.call(className) !== '[object Array]') {
			className = className.split(' ');
		}
		// отбираем из классов узла только те, которые не встречаются в аргументе className
		classArr = classArr.filter(function(iArr) {
			return className.indexOf(iArr) === -1;
		});

		node.className = classArr.join(' ');
	}
}

function hasClass(node, className) {
	if ((node) && (className)) {
		var classArr = node.className.split(' ');
		// className в случае если это строка, переводится к массиву
		if (Object.prototype.toString.call(className) !== '[object Array]') {
			className = className.split(' ');
		}
		// если все классы в аргументе className есть в узле, то возвращаем true
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

var closest = (function() {
	return function(node, callback) {
		var nextParent = node;

		while (nextParent && (!callback(nextParent))) {
			nextParent = nextParent.parentNode;
		}
		return nextParent;
	}
})();

/* Creating class Slider */

function Slider(sliderNode) {
	this.domNodes = sliderNode;
	this.ul = sliderNode.querySelector('.previews');
	this.imgs = this.ul.querySelectorAll('li');
	this.bigImg = sliderNode.querySelector('.big-picture img');
	this.timer = undefined;
}

Slider.prototype.setTimer = function() {
	var obj = {
		func: this.next
	}
	var selfObj = this;

	this.timer = setInterval(function() {
		obj.func.call(selfObj)
	}, 5000);
}
// Метод переключения фреймов карусели вперед
Slider.prototype.nextFrame = function(imageCount) {
	var ul = this.ul;
	var imgs = this.imgs;
	var position = 0;
	var width = imgs[0].scrollWidth + 8;
	if (position >= -width * (imgs.length - imageCount)) {
		position = Math.max(position - width * imageCount, -width * (imgs.length - imageCount));
		ul.style.marginLeft = position + 'px';
	}
}
// Метод переключения фреймов карусели назад
Slider.prototype.backFrame = function(imageCount) {
	var ul = this.ul;
	var imgs = this.imgs;
	var position = 0;
	var width = imgs[0].scrollWidth + 8;

	if (position <= 0) {
		position = Math.min(position + width * imageCount, 0)
		ul.style.marginLeft = position + 'px';
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

	if (index > 2) {
		this.nextFrame(4);
	}

	if (index === (this.imgs.length - 1)) {
		this.show(this.imgs[0].querySelector('img'));
		this.ul.style.marginLeft = 0;
	} else {
		this.show(this.imgs[index + 1].querySelector('img'));
	}
}
// Метод переключения превью назад
Slider.prototype.back = function() {
	var currentImg = this.ul.querySelector('.current');
	var index;
	var width = this.imgs[0].scrollWidth + 8;
	for (var i = 0; i < this.imgs.length; i += 1) {
		if (currentImg === this.imgs[i]) {
			index = i;
		}
	}
	if (index === 3) {
		this.backFrame(4);
	}

	if (index === 0) {
		this.show(this.imgs[this.imgs.length - 1].querySelector('img'));
		this.ul.style.marginLeft = (-width * 3) + 'px';
	} else {
		this.show(this.imgs[index - 1].querySelector('img'));
	}
}
// Метод отображения большого изображения по переданному узлу малого изображения
Slider.prototype.show = function(node) {
	this.bigImg.src = node.getAttribute('bigPic');
	for (var i = 0; i < this.imgs.length; i += 1) {
		removeClass(this.imgs[i], 'current');
	}
	addClass(node.parentNode, 'current');
}

/* add event listeners */

var slidersNode = document.querySelectorAll('.gal');
var sliders = [];
// Создание коллекции обьектов типа Слайдер
for (var i = 0; i < slidersNode.length; i += 1) {
	var sliderObj = new Slider(slidersNode[i]);
	sliderObj.setTimer();
	sliders.push(sliderObj);
}
var currentSlider = sliders[0];
var autoNext;

var clicked = function(event) {
	// Установка текущего слайдера 
	var isSlider = closest(event.target, function(nodeN) {
		return hasClass(nodeN, 'gal');
	});

	if (hasClass(isSlider, 'gal')) {
		for (var i = 0; i < sliders.length; i += 1) {
			if (isSlider === sliders[i].domNodes) {
				currentSlider = sliders[i];
			}
		}
	}
	// Обработка события нажатия на стрелки карусели
	if (hasClass(event.target, 'arrow')) {
		if (hasClass(event.target, 'left-arrow')) {
			currentSlider.backFrame(4);
		}
		if (hasClass(event.target, 'right-arrow')) {
			currentSlider.nextFrame(4);
		}

	}
	// Обработка события нажатия на превью и остановка таймера
	if (event.target.hasAttribute('bigPic')) {
		currentSlider.show(event.target);
		clearInterval(currentSlider.timer);
		//clearTimeout(autoNext);
	}

}

bind(document, 'click', clicked);

// Установка текущего слайдера при наведении
var mouseOvered = function(event) {
	var isSlider = closest(event.target, function(nodeN) {
		return hasClass(nodeN, 'gal');
	});

	if (hasClass(isSlider, 'gal')) {
		for (var i = 0; i < sliders.length; i += 1) {
			if (isSlider === sliders[i].domNodes) {
				currentSlider = sliders[i];
			}
		}
	}
}

bind(document, 'mouseover', mouseOvered);

// Смена изображений и при нажатии стрелок на клавиатуре
var keyDown = function(event) {
	if (event.keyCode === 39) {
		currentSlider.next();
	}
	if (event.keyCode === 37) {
		currentSlider.back();
	}
}

bind(document, 'keydown', keyDown);