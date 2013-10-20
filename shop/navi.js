(function() {
	var groups = navPanel.find('li');

	navPanel.on('click', 'li', function(event) {
		event.preventDefault();
		self = $(this);
		thisGroup = self.find('a');

		groups.removeClass('active');
		self.addClass('active');
		document.cookie = "currTab="+thisGroup.attr('href')+';';
		console.log(thisGroup.attr('href'));
	});
})(navPanel, document.cookie, Mediator);