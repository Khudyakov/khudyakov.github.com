define(['backbone'],
  function(Backbone) {

var Todo = Backbone.Model.extend({

    // Default attributes for the todo item.
    defaults: function() {
      return {
        title: "empty todo...",
        order: Todos.nextOrder(),
        done: false
      };
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }

  });


var TodoList = Backbone.Collection.extend({

    
    model: Todo,

    
    localStorage: new Backbone.LocalStorage("todos-backbone"),

    url:'server/index.php',
    
      done: function() {
      return this.where({done: true});
    },

    
    remaining: function() {
      return this.where({done: false});
    },

    
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

  
    comparator: 'order'

  });

  
  var Todos = new TodoList();

return Todos;

});