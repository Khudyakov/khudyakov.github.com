'use strict';
(function() {
	var mediator = new Mediator();
	var groups = navPanel.find('li');
	setCurrentTab(getCurrTabCookie(groups), groups);

	navPanel.on('click', 'li', function(event) {
		event.preventDefault();
		setCurrentTab($(this), groups);
	});

	function setCurrentTab(tabNode, tabs) {
		tabs.removeClass('active');
		tabNode.addClass('active');
		var thisGroup = tabNode.find('a');
		document.cookie = "currTab=" + thisGroup.attr('href') + ';';
		loader.show();
		getAjaxContent(thisGroup.attr('href'));
	}

	function getCurrTabCookie(groups) {
		var regExp = /(?:currTab\=)(.+?)(?=;|$)/g;
		var linkHref = document.cookie.match(regExp)[0];
		var currTab;

		if (linkHref === null) {
			currTab = groups.eq(0);
		} else {
			var href = linkHref.replace(/currTab=/g, '');

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
		var url = "http://khudyakov.github.io/shop/database/" + catName + ".json";
		var request = $.ajax({
			url: url,
			type: "GET",
			dataType: "json",
		});

		request.done(function(obj) {
			console.log(obj);
		});
	}

})(navPanel, loader, document.cookie, Mediator);