'use strict';

var initFirmFilter = (function(firmBox, Mediator) {
	var mediator = new Mediator();
	var dataObj;

	mediator.subscribe('onCheck', function(firmArr) {
		var filterData = dataObj.filter(function(iArr) {
			return firmArr.indexOf(iArr.manufacturer) > -1;
		});
		mediator._publish('filter',filterData);
		mediator._publish('onFirmFilter',filterData);
	});

	function verifyCheck(checks) {
		var firmArr = [];
		for (var i = 0; i < checks.length; i += 1) {
				if (checks[i].find('input').prop('checked')) {
					firmArr.push(checks[i].text());
				}
		}
		mediator._publish('onCheck',firmArr);
	}

	var initFilter = function(data) {
		var firms = [];
		dataObj = data;
		for (var i = 0; i < data.length; i += 1) {
			if (firms.indexOf(data[i]['manufacturer']) === -1) {
				firms.push(data[i]['manufacturer']);
			}
		}
		firmBox.empty();
		var checks = [];
		for (var i = 0; i < firms.length; i += 1) {
			var check = $('<label><input type="checkbox" checked/>' + firms[i] + '</label><Br>');
			checks.push(check);
		}
		for (var i = 0; i < checks.length; i += 1) {
			checks[i].on('click', function() {
				verifyCheck(checks);
			});
		}
		firmBox.append(checks);
	}

	mediator.subscribe('dataReady', initFilter);
})(firmBox, Mediator);