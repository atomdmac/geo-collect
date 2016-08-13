define([
  'jquery',
  'underscore',
  'backbone'],
function ($, _, Backbone) {

  // Generic Sidebar view
  var SideBarView = Backbone.View.extend({
    events: {
      'click nav': 'toggleOpen'
    },
    initialize: function (collection) {
      this.ul = $('ul', this.el);
      this.collection = collection;
      this.listenTo(this.collection, 'update', this.render);
    },
    render: function () {
      var self = this;
      this.ul.empty();
      this.collection.forEach(function (item, index) {
        var li = self.template(item.toJSON());
        self.ul.append(li);
      });
    },
    toggleOpen: function () {
      this.$el.toggleClass('off');
    }
  });

  // Display items on the ground near the player.
  var GroundView = SideBarView.extend({
    el: '#ground-view',
    template: _.template($('#item-list-ground-view').html())
  });
  
  // Display items carried by the player.
  var InventoryView = SideBarView.extend({
    el: '#inventory-view',
    template: _.template($('#item-list-inventory-view').html())
  });

  // Return objects offered by this module.
  return {
    SideBarView: SideBarView,
    GroundView: GroundView,
    InventoryView: InventoryView
  };

});