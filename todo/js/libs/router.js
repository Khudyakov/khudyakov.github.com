define(['backbone'],
	function(Backbone) {
		var Router = Backbone.Router.extend({
      routes:{
      	'':'home',
        "hello":'hello'
      },

      hello:function() {
        alert('HELLO');
      },

      home:function() {
      	this.navigate('home');

      }
  });


  return new Router();

	});