require.config({
	baseUrl: 'js/libs',
	paths: {
		"view": "../views",
		"collection": "../collections",
		"model": "../models",
		"template": "../../templates",
	},

	shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    }
});

require(['view/app','jquery','text','json2','localstorage'], function(App,$) {
		
  			Backbone.history.start();
			new App;
		
		
});